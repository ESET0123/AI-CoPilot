import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from app.core.logger import log_with_prefix
import os

# IndicTrans2 requires IndicProcessor for proper preprocessing
try:
    from IndicTransToolkit.processor import IndicProcessor
    INDIC_PROCESSOR_AVAILABLE = True
except ImportError:
    INDIC_PROCESSOR_AVAILABLE = False
    log_with_prefix("IndicTransEngine", "⚠️ IndicTransToolkit not installed. Install with: pip install IndicTransToolkit", level="warning")

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
        self.processors = {}
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
            
            # Initialize IndicProcessor if available
            if INDIC_PROCESSOR_AVAILABLE:
                self.processors[direction] = IndicProcessor(inference=True)
                log_with_prefix("IndicTransEngine", "✅ IndicProcessor initialized")
            
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
        processor = self.processors.get(direction)
        
        if not model or not tokenizer:
            return text

        try:
            log_with_prefix("IndicTransEngine", f"⚙️ Tokenizing for {src_lang} -> {tgt_lang}")
            
            # Use IndicProcessor for proper preprocessing if available
            if processor and INDIC_PROCESSOR_AVAILABLE:
                # Preprocess using IndicProcessor (handles language tags and formatting)
                batch = processor.preprocess_batch(
                    [text],  # IndicProcessor expects a list
                    src_lang=src_lang,
                    tgt_lang=tgt_lang
                )
            else:
                # Fallback: Set attributes on the tokenizer directly
                # Some versions of the IndicTransTokenizer require these attributes
                # to be set manually if the processor is not used.
                log_with_prefix("IndicTransEngine", f"⚠️ Using manual attribute fallback: {src_lang}->{tgt_lang}", level="warning")
                tokenizer.src_lang = src_lang
                tokenizer.tgt_lang = tgt_lang
                batch = [text]
            
            # Tokenize the preprocessed batch
            inputs = tokenizer(
                batch,
                truncation=True,
                padding="longest",
                return_tensors="pt",
                return_attention_mask=True
            ).to(self.device)
            
            log_with_prefix("IndicTransEngine", "🔄 Generating translation (this may take a moment)...")
            
            # Generate translations
            with torch.no_grad():
                gen_kwargs = {
                    "use_cache": True,
                    "min_length": 0,
                    "max_length": 256,
                    "num_beams": 5,
                    "num_return_sequences": 1
                }
                
                # For IndicTrans2 fallback, we must specify the target language token
                if not INDIC_PROCESSOR_AVAILABLE:
                    tgt_lang_id = tokenizer.convert_tokens_to_ids(tgt_lang)
                    if tgt_lang_id != tokenizer.unk_token_id:
                        gen_kwargs["forced_bos_token_id"] = tgt_lang_id
                        log_with_prefix("IndicTransEngine", f"🎯 Forced BOS token: {tgt_lang} (ID: {tgt_lang_id})")

                generated_tokens = model.generate(
                    **inputs,
                    **gen_kwargs
                )
            
            # Decode the generated tokens
            decoded_tokens = tokenizer.batch_decode(
                generated_tokens,
                skip_special_tokens=True,
                clean_up_tokenization_spaces=True
            )
            
            # Postprocess using IndicProcessor if available
            if processor and INDIC_PROCESSOR_AVAILABLE:
                translations = processor.postprocess_batch(decoded_tokens, lang=tgt_lang)
                translated_text = translations[0]
            else:
                # Manual postprocessing: if model returned the tag at start, remove it
                translated_text = decoded_tokens[0]
                if translated_text.startswith(tgt_lang):
                    translated_text = translated_text[len(tgt_lang):].strip()
            
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
    "ar": "arb_Arab"  # Not used here but for reference
}
