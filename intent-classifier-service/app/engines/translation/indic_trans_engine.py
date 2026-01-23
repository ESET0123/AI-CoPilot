import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from app.core.logger import log_with_prefix
import os

# Placeholder for IndicTrans2 which might require custom tokenization
# For simplicity in this implementation, we will use the HF implementation if available,
# or fallback to a simpler NLLB model if IndicTrans2 is too complex to setup without cloning their repo.
# However, user requested IndicTrans2.
# ai4bharat/indictrans2-en-indic-1B
# ai4bharat/indictrans2-indic-en-1B

class IndicTransEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IndicTransEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models = {}
        self.tokenizers = {}
        log_with_prefix("IndicTransEngine", f"Initializing on {self.device}")

    def _load_model(self, direction: str):
        """
        direction: 'en-indic' or 'indic-en'
        """
        if direction in self.models:
            return

        token = os.getenv("HF_TOKEN")
        if token:
            log_with_prefix("IndicTransEngine", f"🔑 HF_TOKEN found (starts with: {token[:8]}...)")
        else:
            log_with_prefix("IndicTransEngine", "❌ HF_TOKEN not found in environment. Gated models will fail.", level="error")

        model_name = f"ai4bharat/indictrans2-{direction}-1B"
        
        try:
            log_with_prefix("IndicTransEngine", f"🚀 Loading {model_name}...")
            # Note: trust_remote_code=True is required for IndicTrans2
            self.tokenizers[direction] = AutoTokenizer.from_pretrained(
                model_name, 
                trust_remote_code=True,
                token=token
            )
            self.models[direction] = AutoModelForSeq2SeqLM.from_pretrained(
                model_name, 
                trust_remote_code=True, 
                token=token
            ).to(self.device)
            log_with_prefix("IndicTransEngine", f"✅ Successfully loaded {model_name}")
        except Exception as e:
            msg = str(e)
            if "403" in msg or "gated" in msg.lower():
                log_with_prefix("IndicTransEngine", f"❌ ACCESS DENIED: {model_name} is a GATED model.", level="error")
                log_with_prefix("IndicTransEngine", f"👉 Solution: You MUST visit https://huggingface.co/{model_name} and click 'Agree' to the license.", level="error")
                log_with_prefix("IndicTransEngine", "👉 Also ensure your HF_TOKEN has 'Read' permissions.", level="error")
            else:
                log_with_prefix("IndicTransEngine", f"❌ Failed to load {model_name}: {e}", level="error")
            raise e

    def translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        src_lang, tgt_lang: ISO codes (e.g. 'eng_Latn', 'hin_Deva')
        """
        direction = "en-indic" if src_lang == "eng_Latn" else "indic-en"
        
        # Load model lazily
        self._load_model(direction)
        
        tokenizer = self.tokenizers.get(direction)
        model = self.models.get(direction)
        
        if not model or not tokenizer:
            return text

        try:
            log_with_prefix("IndicTransEngine", f"⚙️ Tokenizing for {src_lang} -> {tgt_lang}")
            
            # Set tokenizer language explicitly
            tokenizer.src_lang = src_lang
            
            # Tokenize
            batch = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256).to(self.device)
            
            log_with_prefix("IndicTransEngine", "🔄 Generating translation (this may take a moment)...")
            
            # Determine target lang ID
            forced_bos_token_id = tokenizer.convert_tokens_to_ids(tgt_lang)
            
            generated_tokens = model.generate(
                **batch, 
                forced_bos_token_id=forced_bos_token_id,
                max_length=256
            )
            
            translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
            log_with_prefix("IndicTransEngine", f"✅ Translation complete: '{translated_text[:30]}...'")
            return translated_text
            
        except Exception as e:
            log_with_prefix("IndicTransEngine", f"❌ Translation failed: {e}", level="error")
            return text

# Map simple codes to FLORES codes
FLORES_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "bn": "ben_Beng",
    "ar": "arb_Arab" # Not used here but for reference
}
