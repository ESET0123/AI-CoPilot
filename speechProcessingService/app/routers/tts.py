from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.modules.services.tts_service import TTSService
import os

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    engine: str = "auto" # 'parler', 'edge', or 'auto'

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
    
    # Determine media type based on extension
    ext = os.path.splitext(file_path)[1].lower()
    media_type = "audio/mpeg" if ext == ".mp3" else "audio/wav"
    filename = f"speech{ext}"
        
    return FileResponse(
        file_path, 
        media_type=media_type, 
        filename=filename
    )

