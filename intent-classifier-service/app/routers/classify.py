from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import logging
from app.modules.intent_classifier import IntentClassifier

router = APIRouter()
logger = logging.getLogger("INTENT_SERVICE")

class ClassifyRequest(BaseModel):
    query: str

class ClassifyResponse(BaseModel):
    intent: str
    confidence: float = 1.0 # Placeholder for now

@router.post("/api/classify", response_model=ClassifyResponse)
async def classify_intent(request: ClassifyRequest):
    """
    Classifies the user intent based on the input query.
    """
    logger.info(f"Classification Request: {request.query}")
    
    intent = IntentClassifier.classify_intent(request.query)
    
    logger.info(f"Classified Intent: {intent}")
    
    return ClassifyResponse(intent=intent)

@router.get("/health")
def health_check():
    return {"status": "ok"}
