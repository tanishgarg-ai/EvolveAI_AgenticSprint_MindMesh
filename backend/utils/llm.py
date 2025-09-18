# utils/llm.py

from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# This LLM is for summarizing structured reports
lab_report_llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="meta-llama/llama-4-scout-17b-16e-instruct", # Fast and good for structured tasks
    temperature=0.1
)

# This is our main, powerful LLM for analysis
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="openai/gpt-oss-120b", # Slower but more powerful for reasoning
    temperature=0.2
)

# <-- NEW: A fast, cheap model for the simple routing task -->
triage_llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="openai/gpt-oss-20b",
    temperature=0.0 # We want this to be deterministic
)

# <-- NEW: Defining LLMs for each specialist -->
# They can use the main 'llm' configuration, but are defined separately for future modularity
general_medicine_llm = llm
cardiology_llm = llm
dermatology_llm = llm