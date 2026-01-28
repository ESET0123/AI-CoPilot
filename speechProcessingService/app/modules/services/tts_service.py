import os
from app.modules.engines.tts.xtts_engine import xtts_engine
from app.modules.engines.tts.indic_parler_engine import indic_parler_engine
from app.core.logger import log_with_prefix

class TTSService:
    @staticmethod
    async def generate_speech(text: str, language: str = "en", engine: str = "auto") -> str:
        """
        Orchestrates speech generation with tiered engine support and fallback.
        Priority: 1. Parler (Indic) 2. XTTS v2 (Local)
        """
        log_with_prefix("TTSService", f"📢 Request received: '{text[:30]}...' (Lang: {language}, Engine: {engine})")
        file_path = None
        engine_used = "None"
        
        # 1. Tier 1: Indic Parler (for specialized Indic languages)
        if engine == "parler" or (engine == "auto" and language not in ["en", "hi"]):
            try:
                log_with_prefix("TTSService", "➡️ Step 1: Attempting synthesis with Indic Parler...")
                file_path = indic_parler_engine.synthesize(text)
                if file_path:
                    engine_used = "Indic Parler"
                    log_with_prefix("TTSService", f"✅ {engine_used} synthesis successful")
            except Exception as e:
                log_with_prefix("TTSService", f"❌ Parler engine failed: {str(e)}. Falling back to XTTS.", level="warning")
                file_path = None
        
        # 2. Tier 2: Coqui XTTS v2 (for High-quality local synthesis)
        if not file_path and (engine == "xtts" or engine == "auto"):
            try:
                log_with_prefix("TTSService", "➡️ Step 2: Attempting synthesis with Coqui XTTS v2...")
                file_path = await xtts_engine.synthesize(text, language)
                if file_path:
                    engine_used = "Coqui XTTS v2"
                    log_with_prefix("TTSService", f"✅ {engine_used} synthesis successful")
            except Exception as e:
                log_with_prefix("TTSService", f"❌ XTTS v2 engine failed: {str(e)}.", level="error")
                file_path = None
        
        if file_path and os.path.exists(file_path):
            log_with_prefix("TTSService", f"🎯 SUCCESS: Speech generated using [{engine_used}] engine.")
            return file_path
            
        return None


