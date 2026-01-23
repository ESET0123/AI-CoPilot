import os
from app.engines.whisper.whisper_engine import whisper_engine
from app.engines.whisper.translation_engine import translation_engine
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
            # 1. Transcribe (Native Language)
            log_with_prefix("STTService", "➡️ Step 1: Transcribing with Whisper...")
            result = whisper_engine.transcribe(file_path, language=language, task="transcribe")
            native_text = result["text"]
            detected_lang = result["detected_language"]
            
            log_with_prefix("STTService", f"✅ Transcription complete. Detected: {detected_lang}")
            log_with_prefix("STTService", f"📝 Native Text: '{native_text}'")
            
            # 2. Translate to English for processing
            if detected_lang and detected_lang != "en":
                log_with_prefix("STTService", f"Detected {detected_lang}, translating for system")
                english_text = await translation_engine.translate(native_text, detected_lang, "en")
                return {
                    "text": english_text, 
                    "original_text": native_text, 
                    "language": detected_lang
                }
            
            return {
                "text": native_text, 
                "original_text": native_text, 
                "language": "en"
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
