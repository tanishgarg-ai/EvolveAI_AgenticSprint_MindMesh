# healthAgentDoctor.py
import json
import os
from typing import List, Dict, Any, TypedDict, cast

import fitz  # PyMuPDF
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# Mock imports for placeholder functions - replace with your actual files
from utils.llm import llm, lab_report_llm, triage_llm, general_medicine_llm, cardiology_llm, dermatology_llm
from utils.pdf_generator import create_pdf_report
from utils.prompts import intake_prompt, lab_prompt, triage_router_prompt, general_medicine_prompt, cardiology_prompt, \
    dermatology_prompt, question_refinement_prompt, medical_report_prompt

load_dotenv()


# --- AGENT STATE DEFINITION ---
class PatientState(TypedDict, total=False):
    raw_input: Dict[str, Any]
    structured_input: Dict[str, Any]
    messages: List[Dict[str, Any]]
    question_queue: List[str]
    pending_question: str  # To hold the current question
    diagnosis_path: str
    final_analysis: Dict[str, Any]
    report_path: str
    analysis_history: List[Dict[str, Any]]
    report_json_path: str


# --- (All your node and utility functions remain here, unchanged) ---
def extract_text_from_pdf(pdf_path: str) -> str:
    if not os.path.exists(pdf_path):
        return "File not found."
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text.strip()


def summarize_lab_report(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    if text == "File not found.":
        return {"error": "Lab report file not found."}
    chain = lab_prompt | lab_report_llm
    summary = chain.invoke({"report_text": text}).content
    return {"summary": summary}


def preprocess_node(state: PatientState) -> Dict[str, Any]:
    print("--- 📝 PREPROCESSING INITIAL DATA ---")
    raw = state.get("raw_input", {})
    messages = state.get("messages", [])
    messages.append({"role": "human", "content": f"Patient provided input:\n{json.dumps(raw, indent=2)}"})
    chain = intake_prompt | llm
    vitals = (raw.get("vitals") or {})
    llm_response = chain.invoke({
        "patient_data": json.dumps(raw),
        "temperature": vitals.get("temperature", ""),
        "bp": vitals.get("bp", ""),
        "pulse": vitals.get("pulse", ""),
        "spo2": vitals.get("spo2", "")
    })
    messages.append({"role": "ai", "content": llm_response.content})
    cleaned_content = llm_response.content.strip().lstrip("```json").rstrip("```").strip()
    try:
        structured_input = json.loads(cleaned_content)
    except Exception as e:
        structured_input = {"raw_llm_output": llm_response.content, "parsing_error": str(e)}
    return {"structured_input": structured_input, "messages": messages}


def process_all_lab_reports_node(state: PatientState) -> Dict[str, Any]:
    print("--- 📄 PROCESSING LAB REPORTS ---")
    files = state.get("raw_input", {}).get("files", {})
    lab_results = {}
    for report_name, file_path in files.items():
        try:
            lab_results[report_name] = summarize_lab_report(file_path)
        except Exception as e:
            lab_results[report_name] = {"error": str(e)}
    structured_input = state.get("structured_input", {}).copy()
    structured_input["lab_results"] = lab_results
    return {"structured_input": structured_input}


def refine_questions_node(state: PatientState) -> Dict[str, Any]:
    print("--- 🧠 REFINING QUESTIONS BASED ON LABS ---")
    structured_input = state.get("structured_input", {})
    initial_questions = structured_input.get("missing_information", [])
    lab_summary = structured_input.get("lab_results", {})
    if not lab_summary or not initial_questions:
        print("--- No labs or initial questions to refine. Skipping. ---")
        return {}
    chain = question_refinement_prompt | llm
    llm_response = chain.invoke(
        {"initial_questions": json.dumps(initial_questions), "lab_summary": json.dumps(lab_summary)})
    try:
        response_json = json.loads(llm_response.content)
        refined_questions = response_json.get("refined_questions", initial_questions)
        updated_structured_input = structured_input.copy()
        updated_structured_input["missing_information"] = refined_questions
        print(f"--- Questions refined. New question count: {len(refined_questions)} ---")
        return {"structured_input": updated_structured_input}
    except Exception as e:
        print(f"--- ERROR: Failed to parse refined questions. Keeping original questions. Error: {e} ---")
        return {}


def initialize_chat_node(state: PatientState) -> Dict[str, Any]:
    print("--- 💬 INITIALIZING CONVERSATION ---")
    if "final_analysis" in state:
        specialist_name = state.get("diagnosis_path", "Specialist").capitalize()
        print(f"\n--- 🩺 The {specialist_name} requires more information... ---")
    questions = state.get("structured_input", {}).get("missing_information", [])
    return {"question_queue": questions}


def ask_one_question_node(state: PatientState) -> Dict[str, Any]:
    question_queue = state.get("question_queue", [])
    if not question_queue:
        return {"pending_question": None}  # Ensure pending is cleared if no questions

    # Pop the next question from the queue
    next_question = question_queue.pop(0)

    print(f"\n--- ❓ ASKING (API Mode): {next_question} ---")

    # Get current messages and append the AI's question
    messages = state.get("messages", [])
    messages.append({"role": "ai", "content": next_question})

    return {
        "question_queue": question_queue,  # The updated queue (one item less)
        "messages": messages,  # The updated message history
        "pending_question": next_question  # The question we just asked
    }


def triage_router_node(state: PatientState) -> Dict[str, Any]:
    print("--- 📧 Triage Router ---")
    initial_status = {"status": "pending", "condition": "Waiting for AI Specialist Analysis...", "confidence": 0,
                      "reasoning": "The system is routing the case to the appropriate specialist.", "evidence": [],
                      "urgency": "low"}
    analysis_history = [initial_status]
    primary_complaint = state.get("raw_input", {}).get("symptoms", "")
    chain = triage_router_prompt | triage_llm
    llm_response = chain.invoke({"primary_complaint": primary_complaint})
    try:
        route_json = json.loads(llm_response.content)
        department = route_json.get("department", "general_medicine")
        print(f"--- Triage Router: Routing to {department} ---")
        return {"diagnosis_path": department, "analysis_history": analysis_history}
    except Exception:
        print("--- Triage Router: Defaulting to general_medicine due to parsing error ---")
        return {"diagnosis_path": "general_medicine", "analysis_history": analysis_history}


def run_specialist_analysis(state: PatientState, specialist_prompt, specialist_llm) -> Dict[str, Any]:
    structured_data = json.dumps(state.get("structured_input", {}), indent=2)
    conversation_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in state.get("messages", [])])
    chain = specialist_prompt | specialist_llm
    llm_response = chain.invoke({"structured_data": structured_data, "conversation_history": conversation_history})
    cleaned_content = llm_response.content.strip().lstrip("```json").rstrip("```").strip()
    try:
        response_json = json.loads(cleaned_content)
        analysis_history = state.get("analysis_history", []).copy()
        analysis_history.append(response_json)
        updates = {"final_analysis": response_json, "analysis_history": analysis_history}
        if response_json.get("status") == "incomplete":
            print("--- 🩺 SPECIALIST REQUIRES MORE INFORMATION ---")
            updated_structured_input = state.get("structured_input", {}).copy()
            updated_structured_input["missing_information"] = response_json.get("missing_information", [])
            updates["structured_input"] = updated_structured_input
        else:
            print("--- ✅ ANALYSIS COMPLETE ---")
        return updates
    except Exception as e:
        print(f"--- ERROR in specialist analysis: {e} ---")
        error_analysis = {"error": "Failed to parse analysis.", "raw_output": llm_response.content}
        analysis_history = state.get("analysis_history", []).copy()
        analysis_history.append(error_analysis)
        return {"final_analysis": error_analysis, "analysis_history": analysis_history}


def general_medicine_analysis_node(state: PatientState) -> Dict[str, Any]:
    print("--- 🩺 GENERAL MEDICINE ANALYSIS ---")
    return run_specialist_analysis(state, general_medicine_prompt, general_medicine_llm)


def cardiology_analysis_node(state: PatientState) -> Dict[str, Any]:
    print("--- 🩺 CARDIOLOGY ANALYSIS ---")
    return run_specialist_analysis(state, cardiology_prompt, cardiology_llm)


def dermatology_analysis_node(state: PatientState) -> Dict[str, Any]:
    print("--- 🩺 DERMATOLOGY ANALYSIS ---")
    return run_specialist_analysis(state, dermatology_prompt, dermatology_llm)

def generate_report_node(state: PatientState) -> Dict[str, str]:
    print("--- ✍️ Generating final clinician report... ---")

    # 1. This part is the same: gather the data from the state
    report_data = {
        "raw_input": state.get("raw_input"),
        "final_analysis": state.get("final_analysis", {}),
        "lab_results": state.get("structured_input", {}).get("lab_results")
    }

    # 2. This is the new logic to create the JSON file
    # (Assuming a modified create_pdf_report or similar utility to get a unique name)
    base_path = create_pdf_report("")
    json_file_path = base_path.replace(".pdf", ".json")

    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=4)
    print(f"--- 💾 Final data saved to {json_file_path} ---")

    # 3. The original PDF generation logic continues as before
    final_json_data = json.dumps(report_data, indent=2)
    print('final_json_data = ', final_json_data)
    report_chain = medical_report_prompt | llm
    markdown_report = report_chain.invoke({"final_json_data": final_json_data}).content
    final_pdf_path = create_pdf_report(markdown_report)

    # 4. Return paths to BOTH files
    return {
        "report_path": final_pdf_path,
        "report_json_path": json_file_path
    }


def decide_if_chat_needed(state: PatientState) -> str:
    print("--- 🤔 CHAT NEEDED? ---")
    if state.get("structured_input", {}).get("missing_information"):
        print("--- ROUTING TO: initialize_chat ---")
        return "start_chat"
    else:
        print("--- ROUTING TO: triage_router (No chat needed) ---")
        return "no_chat_needed"


def decide_to_continue_chat(state: PatientState) -> str:
    print("--- 🤔 CONTINUE CHAT? ---")
    if state.get("question_queue"):
        print("--- ROUTING TO: ask_one_question (More questions remain) ---")
        return "continue_chat"
    else:
        print("--- ROUTING TO: triage_router (All questions asked) ---")
        return "end_chat"


def route_to_specialist(state: PatientState) -> str:
    return cast(str, state.get("diagnosis_path", "general_medicine"))


def decide_after_analysis(state: PatientState) -> str:
    print("--- 🤔 REVIEWING SPECIALIST'S ANALYSIS ---")
    final_analysis = state.get("final_analysis", {})
    status = final_analysis.get("status", "complete")
    if status == "incomplete" and final_analysis.get("missing_information"):
        print("--- ROUTING TO: initialize_chat (Specialist has more questions) ---")
        return "ask_more_questions"
    else:
        print("--- ROUTING TO: generate_report (Analysis is complete) ---")
        return "end_process"


# --- BUILD AND COMPILE THE LANGGRAPH STATE MACHINE ---
builder = StateGraph(PatientState)

builder.add_node("preprocess", preprocess_node)
builder.add_node("process_lab_reports", process_all_lab_reports_node)
builder.add_node("refine_questions", refine_questions_node)
builder.add_node("initialize_chat", initialize_chat_node)
builder.add_node("ask_one_question", ask_one_question_node)
builder.add_node("triage_router", triage_router_node)
builder.add_node("general_medicine_analysis", general_medicine_analysis_node)
builder.add_node("cardiology_analysis", cardiology_analysis_node)
builder.add_node("dermatology_analysis", dermatology_analysis_node)
builder.add_node("generate_report", generate_report_node)

builder.set_entry_point("preprocess")
builder.add_edge("preprocess", "process_lab_reports")
builder.add_edge("process_lab_reports", "refine_questions")

builder.add_conditional_edges("refine_questions", decide_if_chat_needed,
                              {"start_chat": "initialize_chat", "no_chat_needed": "triage_router"})
builder.add_edge("initialize_chat", "ask_one_question")
builder.add_conditional_edges("ask_one_question", decide_to_continue_chat,
                              {"continue_chat": "ask_one_question", "end_chat": "triage_router"})
builder.add_conditional_edges("triage_router", route_to_specialist,
                              {"general_medicine": "general_medicine_analysis", "cardiology": "cardiology_analysis",
                               "dermatology": "dermatology_analysis"})


def add_specialist_edges(specialist_name):
    builder.add_conditional_edges(specialist_name, decide_after_analysis,
                                  {"ask_more_questions": "initialize_chat", "end_process": "generate_report"})


add_specialist_edges("general_medicine_analysis")
add_specialist_edges("cardiology_analysis")
add_specialist_edges("dermatology_analysis")

builder.add_edge("generate_report", END)

# --- COMPILE THE GRAPH WITH CHECKPOINTER AND INTERRUPT ---
checkpointer = MemorySaver()

# ✅ FIX: Tell the graph to pause after asking a question.
# This prevents the recursion error by stopping the graph's execution
# and waiting for the next user input.
graph_with_checkpoint = builder.compile(
    checkpointer=checkpointer,
    interrupt_after=["ask_one_question"]
)

# Keep a non-interrupting version for testing if needed
graph = builder.compile(checkpointer=checkpointer)

# --- MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    print("--- 🚀 Starting AI Diagnostic Agent ---")

    try:
        with open("diagnostic_agent_graph.png", "wb") as f:
            f.write(graph.get_graph().draw_mermaid_png())
        print("--- 📊 Graph visualization saved to diagnostic_agent_graph.png ---")
    except Exception as e:
        print(f"--- ⚠️ Could not generate graph visualization: {e} ---")
        print("--- (This may require installing 'pygraphviz' and system-level 'graphviz') ---")

    # Example test run
    raw_input_data = {
        "Name": "Sarab", "age": 28,
        "symptoms": "Have an itchy red rash on my arm for three days, and I've had a fever.",
        "vitals": {"temperature": "101.5 F", "bp": "110/70"}, "files": {}
    }

    config = {"configurable": {"thread_id": "test-thread-1"}}

    # Run and print state at each step
    for step in graph_with_checkpoint.stream({"raw_input": raw_input_data}, config):
        print("\n" + "=" * 30)
        print(list(step.keys())[0])
        print(list(step.values())[0])
        print("=" * 30 + "\n")

    # Example follow-up
    for step in graph_with_checkpoint.stream(None, config):
        print("\n" + "=" * 30)
        print(list(step.keys())[0])
        print(list(step.values())[0])
        print("=" * 30 + "\n")
