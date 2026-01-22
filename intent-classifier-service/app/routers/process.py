from fastapi import APIRouter
from app.models.schemas import ProcessRequest, ProcessResponse
from app.services.intent_classifier import IntentClassifier
from app.services.dispatcher import Dispatcher
from app.core.logger import log_with_prefix

router = APIRouter()

@router.post("/process", response_model=ProcessResponse)
async def process_request(payload: ProcessRequest):
    """Complete pipeline for intent-based request processing"""
    
    # Force print to console
    log_with_prefix("API", f"REQUEST RECEIVED: {payload.query}")
    
    # Step 1: Classify Intent
    log_with_prefix("API", "Step 1: Classifying intent...")
    intent = await IntentClassifier.classify(payload.query)
    log_with_prefix("API", f"Intent classified as: {intent.value}")
    
    # Step 2: Route and Execute Handler
    log_with_prefix("API", f"Step 2: Routing to {intent.value} handler...")
    response_text = await Dispatcher.route(intent, payload.query)
    log_with_prefix("API", f"Handler complete - Response: {len(response_text)} chars")
    
    log_with_prefix("API", "REQUEST COMPLETE")
    
    return ProcessResponse(
        query=payload.query,
        intent=intent.value,
        response=response_text
    )