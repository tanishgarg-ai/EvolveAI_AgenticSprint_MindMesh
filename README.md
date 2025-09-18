## Features

* **Patient Data Collection**

  * Basic fields: Name, Age, Gender, Weight, Height, Blood Group, Vitals, Symptoms
  * Lab report uploads (PDFs, images)

* **AI Processing**

  * Extracts key medical insights from lab reports
  * Highlights abnormal values and potential risk factors
  * Asks smart follow-up questions for missing critical details

* **Doctor-Ready Outputs**

  * **Interactive Dashboard**:

    * Patient summary
    * Highlighted lab results
    * Possible diseases / areas of concern
    
  * **PDF Report**:
    * Easy to share with doctors
    * Structured for quick review
    * Includes history, and lab findings

---

## Architecture

**App (Frontend)** → **Backend API (FastAPI + AI Models)** → **AI Processing Layer** → **Outputs (Dashboard + PDF Report)**

Workflow:

1. Patient submits personal details + uploads lab reports via app.
2. Backend AI extracts and processes structured + unstructured data.
3. AI asks follow-up questions for missing information.
4. Unified patient profile is generated.
5. Doctor views results in **dashboard** or downloads **PDF report**.

---

## Tech Stack

* **Frontend**: React and Tailwindcss
* **Backend**: FastAPI (Python), LangGraph / LangChain for AI orchestration
* **AI/ML**:
  * LLMs (OpenAI OSS via Groq) for NLP & Q\&A
---

## Benefits

* Saves doctor's time by summarizing scattered patient data
* Ensures **no critical detail is missed**
* Improves **doctor–patient communication**
* Provides **portable medical records** for consultations & telemedicine
* Scalable to hospitals, clinics, and insurance systems

---

## Challenges & Solutions

* **AI Accuracy** → Human-in-the-loop verification for critical values
* **User Adoption** → Training & onboarding for doctors

---

## Project Structure (suggested)

```
/backend
  ├── main.py          # FastAPI entry point
  ├── graph.py         # LangGraph workflow
  ├── utils/           # AI helpers (LLM, OCR, parsers)
  ├── models/          # Pydantic schemas
/frontend
  ├── src/


README.md
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/patient-ai-system.git
cd patient-ai-system
```

### 2. Setup backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Setup frontend

```bash
cd ai_doctor
npm install
npm run dev
```

### 4. Access the system

* **Frontend App** → `http://localhost:5173/`
* **Backend API** → `http://localhost:8000/docs`

### 5. Create a .env file inside the backend/ folder and add your Groq API Key:
* `GROQ_API_KEY=your_api_key_here`
---

## Future Enhancements

* Multi-language support for patient interaction
* Integration with wearable devices (IoT vitals)
* Advanced disease prediction models
* Blockchain-based medical record security

---

## Contributors

* Tanish Garg
* Yatin Rastogi

