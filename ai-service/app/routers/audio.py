from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.transcription import TranscriptionService

router = APIRouter(prefix="/api")

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Receives an audio file (blob) and transcribes it using local Whisper.
    """
    if not TranscriptionService.is_available():
        raise HTTPException(
            status_code=503,
            detail="Speech-to-text service unavailable. Install faster-whisper to enable."
        )

    try:
        text = TranscriptionService.transcribe(file.file)
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}
