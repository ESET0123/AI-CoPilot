from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.services.tts_service import TTSService
import os

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    engine: str = "auto" # 'parler', 'piper', or 'auto'

@router.post("/tts")
async def text_to_speech(payload: TTSRequest):
    """Generates audio from text and returns the file"""
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    file_path = await TTSService.generate_speech(
        payload.text, 
        payload.language, 
        payload.engine
    )
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="TTS generation failed")
        
    return FileResponse(
        file_path, 
        media_type="audio/wav", 
        filename="speech.wav"
    )
