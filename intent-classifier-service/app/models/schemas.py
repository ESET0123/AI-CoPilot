from pydantic import BaseModel
from typing import Optional

class ProcessRequest(BaseModel):
    query: str
    language: Optional[str] = "en"

class ProcessResponse(BaseModel):
    query: str
    intent: str
    response: str
    language: Optional[str] = "en"
    translated_response: Optional[str] = None