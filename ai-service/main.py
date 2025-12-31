import os
import sys
import shutil
import tempfile
import json
import threading
import numpy as np
import pandas as pd
import plotly.express as px
from datetime import datetime

# --- PORTABLE FFMPEG SETUP (Run Offline without Admin Rights) ---
current_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["PATH"] += os.pathsep + current_dir

# --- IMPORTS ---
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, RootModel
from typing import Dict, Any, List, Optional

# Assuming these files are in your 'modules' directory
from modules import llm_router, db_manager, forecasting_engine
from modules.compatibility_layer import LegacyResponseFormatter, sanitize_dataframe_for_json

# --- OPTIONAL WHISPER MODEL (For future STT integration) ---
stt_model = None
try:
    from faster_whisper import WhisperModel
    print("Loading Local Whisper Model...")
    stt_model = WhisperModel("base.en", device="cpu", compute_type="int8")
    print("Whisper Model Loaded.")
except ImportError:
    print("⚠️ faster_whisper not installed. Speech-to-text will be unavailable.")
    print("   To enable STT, run: pip install faster-whisper")
except Exception as e:
    print(f"⚠️ Could not load Whisper model: {e}")
    print("   Speech-to-text will be unavailable.")

# --- Custom JSON Encoder for NumPy/Pandas Fix ---
class CustomEncoder(json.JSONEncoder):
    """
    Handles serialization of NumPy/Pandas objects that the standard json.JSONEncoder misses.
    """
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Initialize FastAPI app
app = FastAPI(title="GridOps Backend API")

# --- CORS MIDDLEWARE (SECURE CONFIGURATION) ---
# Environment-based CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "production":
    # Production: Strict CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,  # Specific origins only
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
    )
else:
    # Development: Relaxed CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# --- PYDANTIC MODELS ---
class DataFrameRow(RootModel):
    root: Dict[str, Any]

class DataFrameData(BaseModel):
    rows: List[DataFrameRow]

class LoginRequest(BaseModel):
    user_id: str
    password: str
    role: str

class AuthResponse(BaseModel):
    success: bool
    role: str | None = None
    message: str | None = None

class ChatRequest(BaseModel):
    message: str
    model_type: str
    user_role: str

class ChatResponse(BaseModel):
    role: str = "assistant"
    type: str = "data"
    content: str
    intent: str
    data: DataFrameData | None = None
    sql: str | None = None
    insight: Dict[str, Any] | None = None
    plot_json: str | None = None

# --- LEGACY COMPATIBILITY MODELS (ai-service-2) ---
class LegacyChatRequest(BaseModel):
    """Request format expected by ai-service-2 clients"""
    conversation_id: str
    message: str

class LegacyChatResponse(BaseModel):
    """Response format expected by ai-service-2 clients"""
    content: str  # JSON string containing {text, type, data, extras}

# --- HELPER FUNCTIONS ---
def generate_plotly_json(df: pd.DataFrame, insight: Dict[str, Any]) -> str | None:
    vt = insight.get("visualization_type")
    x_col = insight.get("x_column")
    y_col = insight.get("y_column")

    if df.empty or not x_col or not y_col:
        return None

    try:
        # Check if columns exist to prevent crash
        if x_col not in df.columns or y_col not in df.columns:
            return None

        if vt == "line":
            fig = px.line(df, x=x_col, y=y_col, template="plotly_dark")
        elif vt == "bar":
            fig = px.bar(df, x=x_col, y=y_col, template="plotly_dark")
        else:
            return None

        # CRITICAL FIX: Use CustomEncoder here
        return json.dumps(fig.to_dict(), cls=CustomEncoder)
    except Exception as e:
        print(f"Plot generation failed: {e}")
        return None

# --- API ENDPOINTS ---
@app.get("/api/health")
def get_health():
    return {"status": "ok", "service": "GridOps LLM Router"}

@app.post("/api/login", response_model=AuthResponse)
def login_handler(request: LoginRequest):
    """
    Validates user credentials and returns the associated role.
    """
    VALID_USERS = {
        "admin01": {"pass": "adminpass", "role": "admin"},
        "emp01": {"pass": "emppass", "role": "employee"},
    }

    user_data = VALID_USERS.get(request.user_id)
    if (user_data and 
        user_data["pass"] == request.password and 
        user_data["role"] == request.role):
        return AuthResponse(success=True, role=user_data['role'], message="Login successful.")
    
    return AuthResponse(success=False, message="Invalid ID, Password, or Role selection.")

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Receives an audio file (blob), saves it temporarily, and transcribes it using local Whisper.
    """
    # Check if Whisper model is available
    if stt_model is None:
        raise HTTPException(
            status_code=503,
            detail="Speech-to-text service unavailable. Install faster-whisper to enable."
        )

    try:
        # 1. Save the uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_audio_path = temp_audio.name

        # 2. Transcribe using Faster-Whisper
        segments, info = stt_model.transcribe(temp_audio_path, beam_size=5)

        # 3. Combine segments into single string
        text = " ".join([segment.text for segment in segments]).strip()

        # 4. Clean up temp file
        os.remove(temp_audio_path)

        return {"text": text}
    except Exception as e:
        print(f"Transcription Error: {e}")
        return {"error": str(e)}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_handler(request: ChatRequest):
    user_query = request.message
    model_type = request.model_type

    try:
        # 1. Intent Classification
        intent = llm_router.classify_intent(user_query, model_type=model_type)

        # --- RBAC Check ---
        if request.user_role == "employee" and intent == "REVENUE_FORECAST":
            return ChatResponse(
                type="error",
                content="Authorization Failed: Employees are restricted from accessing Revenue Forecasting data.",
                intent=intent
            )

        df = pd.DataFrame()
        generated_sql = ""
        insight = {}

        # 2. Routing Logic
        if intent == "REVENUE_FORECAST":
            # Call Forecasting Engine
            df, msg = forecasting_engine.predict_revenue_for_date(user_query)
            if df.empty:
                return ChatResponse(
                    type="error",
                    content=f"Forecasting Failed: {msg}",
                    intent=intent
                )

            # No graph for single point forecast
            insight = {
                "summary": msg,
                "visualization_type": "none",
                "x_column": None,
                "y_column": None
            }
        else:
            # SQL_QUERY
            # 2a. Generate SQL
            generated_sql, raw_llm_response = llm_router.generate_sql(user_query, model_type=model_type)
            if generated_sql.startswith("-- SYSTEM ERROR"):
                return ChatResponse(
                    type="error",
                    content=generated_sql.replace("-- SYSTEM ERROR: ", ""),
                    intent=intent
                )

            # 2b. Execute SQL
            try:
                df = db_manager.run_select_query(generated_sql)
            except Exception as e:
                return ChatResponse(
                    type="error",
                    content=f"SQL Execution Failed: {str(e)}",
                    intent=intent
                )

            # 2c. Analyze Data
            insight = llm_router.analyze_data(df, user_query, model_type=model_type)

        # --- Final Response Construction ---
        if not df.empty:
            # Handle NaN/Inf values by replacing them to avoid JSON errors
            df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
            data_rows = df.to_dict('records')
        else:
            data_rows = []

        # Generate Plotly JSON
        plot_output_json = generate_plotly_json(df, insight)

        return ChatResponse(
            type="data",
            content=insight.get("summary", "Data retrieved successfully."),
            intent=intent,
            data=DataFrameData(rows=data_rows),
            sql=generated_sql,
            insight=insight,
            plot_json=plot_output_json
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# ───────────────── LEGACY COMPATIBILITY ENDPOINTS (ai-service-2) ─────────────────

# Cancellation tracking (similar to ai-service-2)
cancellation_tokens: Dict[str, threading.Event] = {}

def get_cancel_event(convo_id: str) -> threading.Event:
    """Get or create a cancellation event for a conversation"""
    if not convo_id:
        return threading.Event()  # dummy
    if convo_id not in cancellation_tokens:
        cancellation_tokens[convo_id] = threading.Event()
    return cancellation_tokens[convo_id]

def clear_cancel_event(convo_id: str):
    """Clear cancellation event for a conversation"""
    if convo_id in cancellation_tokens:
        cancellation_tokens[convo_id].clear()

@app.post("/chat", response_model=LegacyChatResponse)
async def legacy_chat_endpoint(request: LegacyChatRequest):
    """
    Legacy compatibility endpoint matching ai-service-2 contract.
    This endpoint provides backward compatibility with the existing backend
    without requiring any changes to frontend or backend code.
    """
    conversation_id = request.conversation_id
    user_query = request.message

    # Clear any previous cancellation for this conversation
    clear_cancel_event(conversation_id)
    cancel_event = get_cancel_event(conversation_id)

    try:
        # Default to "local" model and "admin" role for compatibility
        model_type = "local"
        user_role = "admin"

        # 1. Intent Classification
        intent = llm_router.classify_intent(user_query, model_type=model_type)

        # Check for cancellation
        if cancel_event.is_set():
            return LegacyChatResponse(
                content=json.dumps({
                    "text": "Request cancelled by user",
                    "type": "error",
                    "data": None,
                    "extras": {}
                })
            )

        df = pd.DataFrame()
        generated_sql = ""
        insight = {}

        # 2. Routing Logic
        if intent == "REVENUE_FORECAST":
            # Call Forecasting Engine
            df, msg = forecasting_engine.predict_revenue_for_date(user_query)
            if df.empty:
                return LegacyChatResponse(
                    **LegacyResponseFormatter.convert_to_legacy_format(
                        content=f"Forecasting Failed: {msg}",
                        intent=intent,
                        response_type="error"
                    )
                )

            # Prepare data for response
            data_rows = sanitize_dataframe_for_json(df)
            return LegacyChatResponse(
                **LegacyResponseFormatter.convert_to_legacy_format(
                    content=msg,
                    intent=intent,
                    data=data_rows,
                    response_type="data"
                )
            )
        else:
            # SQL_QUERY
            # Check for cancellation
            if cancel_event.is_set():
                return LegacyChatResponse(
                    content=json.dumps({
                        "text": "Request cancelled by user",
                        "type": "error",
                        "data": None,
                        "extras": {}
                    })
                )

            # 2a. Generate SQL with cancellation support
            generated_sql, raw_llm_response = llm_router.generate_sql(
                user_query,
                model_type=model_type
            )

            if generated_sql.startswith("-- SYSTEM ERROR"):
                return LegacyChatResponse(
                    **LegacyResponseFormatter.convert_to_legacy_format(
                        content=generated_sql.replace("-- SYSTEM ERROR: ", ""),
                        intent=intent,
                        response_type="error"
                    )
                )

            # Check for cancellation
            if cancel_event.is_set():
                return LegacyChatResponse(
                    content=json.dumps({
                        "text": "Request cancelled by user",
                        "type": "error",
                        "data": None,
                        "extras": {}
                    })
                )

            # 2b. Execute SQL
            try:
                df = db_manager.run_select_query(generated_sql)
            except Exception as e:
                return LegacyChatResponse(
                    **LegacyResponseFormatter.convert_to_legacy_format(
                        content=f"SQL Execution Failed: {str(e)}",
                        intent=intent,
                        response_type="error"
                    )
                )

            # Check for cancellation
            if cancel_event.is_set():
                return LegacyChatResponse(
                    content=json.dumps({
                        "text": "Request cancelled by user",
                        "type": "error",
                        "data": None,
                        "extras": {}
                    })
                )

            # 2c. Analyze Data
            insight = llm_router.analyze_data(df, user_query, model_type=model_type)

            # --- Final Response Construction ---
            data_rows = sanitize_dataframe_for_json(df)
            return LegacyChatResponse(
                **LegacyResponseFormatter.convert_to_legacy_format(
                    content=insight.get("summary", "Data retrieved successfully."),
                    intent=intent,
                    data=data_rows,
                    sql=generated_sql,
                    insight=insight,
                    response_type="data"
                )
            )

    except Exception as e:
        return LegacyChatResponse(
            **LegacyResponseFormatter.convert_to_legacy_format(
                content=f"Internal Server Error: {str(e)}",
                intent="ERROR",
                response_type="error"
            )
        )

# @app.post("/stop")
# def legacy_stop_endpoint(payload: dict = Body(...)):
    # """
    # Legacy compatibility endpoint for stopping generation.
    # Matches ai-service-2 /stop endpoint contract.
    # """
    # convo_id = payload.get("conversation_id")
    # if convo_id:
    #     event = get_cancel_event(convo_id)
    #     event.set()
    #     return {"message": "Stop signal registered"}
    # return {"error": "Missing conversation_id"}
@app.post("/stop")
def stop_generation(payload: dict = Body(...)):
    convo_id = payload.get("conversation_id")

    if not convo_id:
        return {"error": "conversation_id missing"}

    event = cancellation_tokens.get(convo_id)
    if event:
        event.set()

    return {"message": "Stop signal received"}

# ───────────────── ENTRYPOINT ─────────────────

if __name__ == "__main__":
    import uvicorn
    # Run on port 8001 to match ai-service-2
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")