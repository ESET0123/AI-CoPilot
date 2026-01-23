from fastapi import APIRouter
from app.models.schemas import ProcessRequest, ProcessResponse
from app.services.pipeline_service import PipelineService
from app.core.logger import log_with_prefix

router = APIRouter()

@router.post("/process", response_model=ProcessResponse)
async def process_request(payload: ProcessRequest):
    """Complete pipeline for intent-based request processing with Translation support"""
    log_with_prefix("API", f"REQUEST RECEIVED: {payload.query[:50]}...")
    
    return await PipelineService.process_full_cycle(payload)
