# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

from langgraph_logic import graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Vitals(BaseModel):
    temperature: str
    bp: str
    pulse: str
    spo2: str


class PatientData(BaseModel):
    Name: str
    age: int
    weight: int
    gender: str
    blood_group: str
    symptoms: str
    duration: str
    vitals: Vitals


class HigherData(BaseModel):
    patient_data: PatientData


class ChatRequest(BaseModel):
    answer: str



sessions: Dict[str, Dict] = {}
session_questions: Dict[str, List] = {}
session_index: Dict[str, int] = {}
session_answers: Dict[str, List] = {}



@app.post("/diagnose/start")
def start(patient: HigherData):
    patient_dict = patient.dict()
    state = graph.invoke({"raw_input": patient_dict}, {"recursion_limit": 100})
    session_id = str(len(sessions) + 1)

    sessions[session_id] = state
    session_questions[session_id] = state.get("structured_input", {}).get("missing_information", [])
    session_index[session_id] = 0
    session_answers[session_id] = []

    first_question = None
    if session_questions[session_id]:
        first_question = session_questions[session_id][0]
        session_index[session_id] = 1

    return {
        "conversation_id": session_id,
        "pending_question": first_question,
        "total_questions": len(session_questions[session_id])
    }


@app.post("/diagnose/continue")
def continue_chat(req: ChatRequest, conversation_id: str):
    if conversation_id not in sessions:
        return {"error": "Invalid conversation_id"}

    idx = session_index[conversation_id]
    questions = session_questions[conversation_id]

    # Save previous answer
    session_answers[conversation_id].append(req.answer)

    if idx >= len(questions):
        return {
            "done": True,
            "final_analysis": {
                "answers": session_answers[conversation_id]
            }
        }

    question = questions[idx]
    session_index[conversation_id] = idx + 1

    return {
        "conversation_id": conversation_id,
        "pending_question": question,
        "remaining": len(questions) - idx
    }
