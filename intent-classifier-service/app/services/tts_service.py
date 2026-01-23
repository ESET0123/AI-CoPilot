import os
from app.engines.tts.piper_engine import tts_engine
from app.engines.tts.indic_parler_engine import indic_parler_engine
from app.core.logger import log_with_prefix

class TTSService:
    @staticmethod
    async def generate_speech(text: str, language: str = "en", engine: str = "auto") -> str:
        """
        Orchestrates speech generation with tiered engine support and fallback.
        Returns the path to the generated WAV file.
        """
        log_with_prefix("TTSService", f"📢 Request received: '{text[:30]}...' (Lang: {language}, Engine: {engine})")
        file_path = None
        
        # 1. Tier 1: Indic Parler (for high-quality Indic languages)
        # 1. Tier 1: Indic Parler (for high-quality Indic languages)
        if engine == "parler" or (engine == "auto" and language != "en"):
            try:
                log_with_prefix("TTSService", f"➡️ Step 1: Attempting high-quality synthesis with Parler...")
                file_path = indic_parler_engine.synthesize(text)
                if file_path:
                    log_with_prefix("TTSService", "✅ Parler synthesis successful")
            except Exception as e:
                log_with_prefix("TTSService", f"❌ Parler engine failed: {str(e)}. Falling back to Piper.", level="warning")
                file_path = None
        
        # 2. Tier 2: Piper (for English or as a robust fallback)
        # 2. Tier 2: Piper (for English or as a robust fallback)
        if not file_path:
            try:
                log_with_prefix("TTSService", "➡️ Step 2: Synthesizing with Piper...")
                file_path = await tts_engine.synthesize(text, language)
                if file_path:
                    log_with_prefix("TTSService", "✅ Piper synthesis successful")
            except Exception as e:
                log_with_prefix("TTSService", f"❌ Piper engine failed: {str(e)}", level="error")
                return None
        
        if file_path and os.path.exists(file_path):
            return file_path
            
        return None
