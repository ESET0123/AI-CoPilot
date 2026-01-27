from app.core.logger import log_with_prefix
from app.modules.speech.engines.translation.indictrans_engine import indictrans_engine
from app.modules.speech.engines.translation.helsinki_engine import HelsinkiEngine

class TranslationEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TranslationEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        # Engines are initialized globally in their modules
        pass
        
    async def translate(self, text: str, from_lang: str, to_lang: str = "en") -> str:
        """
        Routes translation requests to the appropriate engine.
        Indic Languages -> NLLB-200
        International -> Helsinki-NLP or NLLB-200
        """
        if not text or from_lang == to_lang:
            return text

        # Map 'auto' to 'en' basic assumption if needed, or handle detection
        if from_lang == "auto":
            from_lang = "en"

        log_with_prefix("Translator", f"Routing: {from_lang} -> {to_lang}")

        # 1. Indic & Global Translation (Hindi/Kannada/Bengali <-> English)
        # Using IndicTrans2 (AI4Bharat) for these as it's state-of-the-art for Indic languages
        if from_lang in ["hi", "kn", "bn", "en"] and to_lang in ["hi", "kn", "bn", "en"]:
            log_with_prefix("Translator", "Using IndicTrans2")
            return indictrans_engine.translate(text, from_lang, to_lang)

        # 2. Helsinki Translation (Arabic <-> English) - Keeping as alternative
        if (from_lang == "ar" and to_lang == "en") or \
           (from_lang == "en" and to_lang == "ar"):
            
            log_with_prefix("Translator", "Using Helsinki-NLP")
            try:
                # Get or create instance
                engine = HelsinkiEngine.get_instance(from_lang, to_lang)
                return engine.translate(text)
            except Exception as e:
                log_with_prefix("Translator", f"❌ Helsinki failed: {e}", level="error")
                # IndicTrans2 does not support Arabic, so we return the original text
                log_with_prefix("Translator", "⚠️ No fallback available for Arabic. Returning original.")
                return text

        log_with_prefix("Translator", f"⚠️ No specialized engine for {from_lang}->{to_lang}. Returning original.")
        return text

# Global instance
translation_engine = TranslationEngine()
