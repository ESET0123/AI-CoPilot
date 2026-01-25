import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from app.core.logger import log_with_prefix
import os

# NLLB FLORES language codes
NLLB_LANG_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "bn": "ben_Beng",
    "ar": "arb_Arab"
}

class NLLBEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLLBEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "facebook/nllb-200-distilled-600M"
        self.tokenizer = None
        self.model = None
        log_with_prefix("NLLBEngine", f"Initializing on {self.device}")

    def _load_model(self):
        if self.model is not None:
            return

        token = os.getenv("HF_TOKEN")
        try:
            log_with_prefix("NLLBEngine", f"🚀 Loading {self.model_name}...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                token=token
            )
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name, 
                token=token
            ).to(self.device)
            log_with_prefix("NLLBEngine", f"✅ Successfully loaded {self.model_name}")
        except Exception as e:
            log_with_prefix("NLLBEngine", f"❌ Failed to load {self.model_name}: {e}", level="error")
            raise e

    def translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        src_lang, tgt_lang: ISO codes (mapped to NLLB codes)
        """
        if not text or src_lang == tgt_lang:
            return text

        # Map to NLLB codes
        src_code = NLLB_LANG_MAP.get(src_lang, src_lang)
        tgt_code = NLLB_LANG_MAP.get(tgt_lang, tgt_lang)

        # Load model lazily
        self._load_model()

        try:
            log_with_prefix("NLLBEngine", f"⚙️ Translating: {src_code} -> {tgt_code}")
            
            # Set source language
            self.tokenizer.src_lang = src_code
            
            # Tokenize
            inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
            
            # Generate
            with torch.no_grad():
                translated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.convert_tokens_to_ids(tgt_code),
                    max_length=256,
                    num_beams=4,
                    early_stopping=True
                )
            
            # Decode
            translated_text = self.tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
            
            log_with_prefix("NLLBEngine", f"✅ Translation complete: '{translated_text[:30]}...'")
            return translated_text
            
        except Exception as e:
            log_with_prefix("NLLBEngine", f"❌ Translation failed: {e}", level="error")
            return text

# Global instance
nllb_engine = NLLBEngine()
