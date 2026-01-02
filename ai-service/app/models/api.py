from pydantic import BaseModel, RootModel
from typing import Dict, Any, List, Optional

# --- JSON Utility Models ---
class DataFrameRow(RootModel):
    root: Dict[str, Any]

class DataFrameData(BaseModel):
    rows: List[DataFrameRow]

# --- Auth Models ---
class LoginRequest(BaseModel):
    user_id: str
    password: str
    role: str

class AuthResponse(BaseModel):
    success: bool
    role: str | None = None
    message: str | None = None

# --- Chat Models ---
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

# --- Legacy Models ---
class LegacyChatRequest(BaseModel):
    """Request format expected by ai-service-2 clients"""
    conversation_id: str
    message: str

class LegacyChatResponse(BaseModel):
    """Response format expected by ai-service-2 clients"""
    content: str  # JSON string containing {text, type, data, extras}
