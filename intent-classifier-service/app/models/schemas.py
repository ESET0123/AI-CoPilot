from pydantic import BaseModel

class ProcessRequest(BaseModel):
    query: str

class ProcessResponse(BaseModel):
    query: str
    intent: str
    response: str