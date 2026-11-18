"""FastAPI bridge between the React client and the existing Python pipeline."""
import os
import shutil
import tempfile
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import ask_question, build_rag_chain
from core.summarizer import generate_title, summarize
from core.transcriber import transcribe_all
from utils.audio_processor import process_input

app = FastAPI(title="AI Video Assistant API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
sessions: dict[str, object] = {}


class Question(BaseModel):
    session_id: str
    question: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


def analyze(source: str, language: str):
    chunks = process_input(source)
    transcript = transcribe_all(chunks, language)
    title = generate_title(transcript)
    summary = summarize(transcript)
    action_items = extract_action_items(transcript)
    decisions = extract_key_decisions(transcript)
    questions = extract_questions(transcript)
    rag_chain = build_rag_chain(transcript)
    session_id = str(uuid.uuid4())
    sessions[session_id] = rag_chain
    return {"session_id": session_id, "title": title, "transcript": transcript, "summary": summary,
            "action_items": action_items, "key_decisions": decisions, "open_questions": questions}


@app.post("/api/analyze")
def analyze_url(source: str = Form(...), language: str = Form("english")):
    if not source.startswith(("http://", "https://")):
        raise HTTPException(400, "Enter a valid YouTube or video URL, or upload an audio/video file.")
    try:
        return analyze(source, language)
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@app.post("/api/analyze-upload")
async def analyze_upload(file: UploadFile = File(...), language: str = Form("english")):
    suffix = Path(file.filename or "upload.wav").suffix or ".wav"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            path = tmp.name
        return analyze(path, language)
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc
    finally:
        if "path" in locals() and os.path.exists(path):
            os.unlink(path)


@app.post("/api/chat")
def chat(body: Question):
    chain = sessions.get(body.session_id)
    if not chain:
        raise HTTPException(404, "This analysis session has expired. Analyze the meeting again.")
    try:
        return {"answer": ask_question(chain, body.question)}
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc
