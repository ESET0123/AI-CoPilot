import os
import shutil
import tempfile
from app.core.logging import logger

try:
    from faster_whisper import WhisperModel
    print("Loading Local Whisper Model...")
    # NOTE: In a real app, you might want to load this lazily or in a separate worker
    stt_model = WhisperModel("base.en", device="cpu", compute_type="int8")
    print("Whisper Model Loaded.")
except ImportError:
    logger.warning("faster_whisper not installed. Speech-to-text will be unavailable.")
    stt_model = None
except Exception as e:
    logger.error(f"Could not load Whisper model: {e}")
    stt_model = None

class TranscriptionService:
    @staticmethod
    def is_available() -> bool:
        return stt_model is not None

    @staticmethod
    def transcribe(file_obj) -> str:
        if not stt_model:
            raise Exception("Service unavailable")

        # Save the uploaded file to a temporary file
        temp_audio_path = ""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                shutil.copyfileobj(file_obj, temp_audio)
                temp_audio_path = temp_audio.name
            
            # Transcribe
            segments, info = stt_model.transcribe(temp_audio_path, beam_size=5)
            text = " ".join([segment.text for segment in segments]).strip()
            
            return text
        finally:
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
