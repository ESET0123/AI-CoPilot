from pydantic import BaseModel
from typing import Optional

class ProcessRequest(BaseModel):
    query: str
    language: str = "en"  # Default to English
    role: Optional[str] = None

class ProcessResponse(BaseModel):
    query: str
    intent: str
    response: str
    language: str
    translated_response: Optional[str] = None
    english_response: Optional[str] = None
