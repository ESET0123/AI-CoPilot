from fastapi import APIRouter, UploadFile, File, Form
from app.core.logger import log_with_prefix
from app.services.stt_service import STTService
import os
import tempfile

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    method: str = Form("google-webkit"),
    language: str = Form(None)
):
    """Transcribe audio using specified method"""
    
    log_with_prefix("Transcribe", f"🎤 Received transcription request: {method} ({language or 'auto'})")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name
    
    try:
        # Use the newly named STTService
        result = await STTService.process_audio(temp_path, method, language)
        
        log_with_prefix("Transcribe", f"✅ Success: {len(result['text'])} chars")
        return {
            "text": result["text"],
            "original_text": result["original_text"],
            "language": result["language"]
        }
        
    except Exception as e:
        log_with_prefix("Transcribe", f"❌ Error during transcription: {str(e)}", level="error")
        return {"error": str(e)}
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
            log_with_prefix("Transcribe", "🧹 Cleaned up temp file")
