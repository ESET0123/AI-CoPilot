from app.core.logger import log_with_prefix
from app.engines.translation.indic_trans_engine import IndicTransEngine, FLORES_MAP
from app.engines.translation.helsinki_engine import HelsinkiEngine

class TranslationEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TranslationEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.indic_engine = IndicTransEngine()
        # Helsinki engine instances are created on demand
        
    async def translate(self, text: str, from_lang: str, to_lang: str = "en") -> str:
        """
        Routes translation requests to the appropriate engine.
        Indic Languages -> IndicTrans2
        International -> Helsinki-NLP
        """
        if not text or from_lang == to_lang:
            return text

        # Map 'auto' to 'en' basic assumption if needed, or handle detection
        if from_lang == "auto":
            from_lang = "en"

        log_with_prefix("Translator", f"🌐 Routing: {from_lang} -> {to_lang}")

        # 1. Indic Translation (Hindi/Kannada <-> English)
        if (from_lang in ["hi", "kn", "bn"] and to_lang == "en") or \
           (from_lang == "en" and to_lang in ["hi", "kn", "bn"]):
            
            src_code = FLORES_MAP.get(from_lang)
            tgt_code = FLORES_MAP.get(to_lang)
            
            if src_code and tgt_code:
                log_with_prefix("Translator", "🚀 Using IndicTrans2")
                return self.indic_engine.translate(text, src_code, tgt_code)

        # 2. Helsinki Translation (Arabic <-> English)
        if (from_lang == "ar" and to_lang == "en") or \
           (from_lang == "en" and to_lang == "ar"):
            
            log_with_prefix("Translator", "🚀 Using Helsinki-NLP")
            try:
                # Get or create instance
                engine = HelsinkiEngine.get_instance(from_lang, to_lang)
                return engine.translate(text)
            except Exception as e:
                log_with_prefix("Translator", f"❌ Helsinki failed: {e}", level="error")
                return text

        log_with_prefix("Translator", f"⚠️ No specialized engine for {from_lang}->{to_lang}. Returning original.")
        return text

# Global instance
translation_engine = TranslationEngine()
