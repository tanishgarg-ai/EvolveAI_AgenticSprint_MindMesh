# backend/main.py
import uuid
import os
import json
import asyncio
import shutil
from typing import Any, Dict, Optional, List

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, staticfiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# IMPORTANT: Import the stateful graph
from langgraph_logic import graph_with_checkpoint

# --- App Initialization ---
app = FastAPI(
    title="AI Diagnostic Assistant API",
    description="Handles patient data, file uploads, and conversational diagnosis.",
    version="1.0.0"
)

# --- Static File Serving ---
# This will allow the frontend to access the generated PDF report
REPORTS_DIR = "generated_reports"
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/reports", staticfiles.StaticFiles(directory=REPORTS_DIR), name="reports")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- File Upload Configuration ---
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Pydantic Schemas ---
class ChatResponse(BaseModel):
    conversation_id: str
    ai_message: Optional[str] = None
    final_report_url: Optional[str] = None  # URL to the PDF
    final_report_data: Optional[Dict[str, Any]] = None  # The actual JSON data
    is_complete: bool = False


# --- Unified Chat Endpoint ---
@app.post("/diagnose/chat", response_model=ChatResponse)
async def chat(
        conversation_id: Optional[str] = Form(None),
        user_input_json: str = Form(...),
        lab_report: Optional[UploadFile] = File(None),
        health_record: Optional[UploadFile] = File(None)
):
    try:
        convo_id = conversation_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": convo_id}}

        graph_input: Optional[Dict[str, Any]] = None
        user_input = json.loads(user_input_json)

        if not conversation_id:
            print("--- 🚀 Starting new conversation ---")
            patient_data = user_input
            file_paths = {}

            # Handle file uploads
            if lab_report:
                file_path = os.path.join(UPLOAD_DIR, f"{convo_id}_{lab_report.filename}")
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(lab_report.file, buffer)
                file_paths['lab_report'] = file_path

            if health_record:
                file_path = os.path.join(UPLOAD_DIR, f"{convo_id}_{health_record.filename}")
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(health_record.file, buffer)
                file_paths['health_record'] = file_path

            patient_data['files'] = file_paths
            graph_input = {"raw_input": patient_data}

        else:
            print(f"--- 💬 Continuing conversation: {convo_id} ---")
            current_state_snapshot = await asyncio.to_thread(graph_with_checkpoint.get_state, config)
            if not current_state_snapshot:
                raise HTTPException(status_code=404, detail="Conversation state not found.")

            current_values = current_state_snapshot.values
            current_values["messages"].append({"role": "human", "content": user_input.get("answer", "")})
            await asyncio.to_thread(graph_with_checkpoint.update_state, config, current_values)
            graph_input = None

        final_state_snapshot = await asyncio.to_thread(
            graph_with_checkpoint.invoke, graph_input, config
        )

        final_state = final_state_snapshot if final_state_snapshot else {}
        ai_message = final_state.get("pending_question")

        report_path = final_state.get("report_path")
        report_json_path = final_state.get("report_json_path")
        is_complete = report_path is not None and report_json_path is not None

        final_report_url = None
        final_report_data = None

        # ✅ MODIFIED: If complete, read the JSON and create a public URL for the PDF
        if is_complete:
            ai_message = None  # No more questions

            # Create a public URL for the PDF
            pdf_filename = os.path.basename(report_path)
            final_report_url = f"http://127.0.0.1:8000/reports/{pdf_filename}"

            # Read the JSON data to send to the frontend
            try:
                with open(report_json_path, 'r', encoding='utf-8') as f:
                    final_report_data = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"--- ❌ Error reading report JSON: {e} ---")
                # Handle error case, maybe return an error message
                pass

        return ChatResponse(
            conversation_id=convo_id,
            ai_message=ai_message,
            final_report_url=final_report_url,
            final_report_data=final_report_data,
            is_complete=is_complete,
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in user_input_json.")
    except Exception as e:
        print(f"--- ❌ An unexpected error occurred: {type(e).__name__} - {e} ---")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")