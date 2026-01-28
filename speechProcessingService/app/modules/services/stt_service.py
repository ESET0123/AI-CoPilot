import os
from app.modules.engines.whisper.whisper_engine import whisper_engine
from app.modules.engines.whisper.translation_engine import translation_engine
from app.core.logger import log_with_prefix

class STTService:
    @staticmethod
    async def process_audio(file_path: str, method: str = "google-webkit", language: str = None) -> dict:
        """
        Processes audio and returns both transcribed and translated text if needed.
        Returns: {"text": str, "original_text": str, "detected_language": str}
        """
        log_with_prefix("STTService", f"🎤 Processing audio with method: {method}")
        log_with_prefix("STTService", f"📄 Params: Language={language or 'auto'}")
        
        if method == "review":
            # 1. Transcribe (Native Language)
            log_with_prefix("STTService", "➡️ Step 1: Transcribing with Whisper...")
            result = whisper_engine.transcribe(file_path, language=language, task="transcribe")
            native_text = result["text"]
            detected_lang = result["detected_language"]
            
            log_with_prefix("STTService", f"✅ Transcription complete. Detected: {detected_lang}")
            log_with_prefix("STTService", f"📝 Native Text: '{native_text}'")
            
            # Return native text without translation
            # The translation to English will be handled by the PipelineService when sent.
            return {
                "text": native_text, 
                "original_text": native_text, 
                "language": detected_lang or language or "en"
            }

        elif method == "translate-direct":
            # Whisper direct translation to English (One-way)
            result = whisper_engine.transcribe(file_path, language=language, task="translate")
            return {
                "text": result["text"], 
                "original_text": result["text"], 
                "language": "en"
            }
            
        else:
            log_with_prefix("STTService", f"❌ Unsupported method: {method}", level="error")
            raise ValueError(f"Method {method} not supported")
