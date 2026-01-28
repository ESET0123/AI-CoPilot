import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator
from app.core.logger import log_with_prefix
import os
import re

# ISO codes to IndicTrans2 language codes and scripts
INDIC_LANG_MAP = {
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "bn": "ben_Beng",
    "en": "eng_Latn",
    "mr": "mar_Deva",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "ml": "mal_Mlym",
    "or": "ori_Orya"
}

class SimpleIndicProcessor:
    def __init__(self):
        self.factory = IndicNormalizerFactory()

    def preprocess(self, text: str, src_lang: str, tgt_lang: str) -> str:
        # 1. Normalization
        # Only normalize if it's an Indian language (3-letter code not starting with eng)
        if not src_lang.startswith("eng"):
            try:
                # Extract script from the tag (e.g., 'hin_Deva' -> 'hi' or 'hin')
                lang_code = src_lang.split("_")[0]
                # IndicNLP normalizer typically uses 2-letter codes, but we'll try to map
                # or just use the 3-letter code if the factory supports it.
                # Common mapping for IndicNLP
                iso_to_indic = {
                    "hin": "hi", "kan": "kn", "ben": "bn", "mar": "mr", "tam": "ta",
                    "tel": "te", "guj": "gu", "pan": "pa", "mal": "ml", "ori": "or"
                }
                norm_lang = iso_to_indic.get(lang_code, lang_code)
                
                normalizer = self.factory.get_normalizer(norm_lang)
                text = normalizer.normalize(text)
            except Exception as e:
                log_with_prefix("IndicProcessor", f"Normalization skipped for {src_lang}: {e}", level="warning")
        
        # 2. Normalize excessive spaces WITHIN lines only (preserve newlines and single spaces)
        # Replace multiple consecutive spaces with a single space, but keep newlines
        lines = text.split('\n')
        normalized_lines = [re.sub(r' {2,}', ' ', line) for line in lines]
        text = '\n'.join(normalized_lines)
        
        # 3. Add tags for IndicTrans2
        # Format: "<src_lang> <tgt_lang> <text>"
        return f"{src_lang} {tgt_lang} {text}"

class IndicTrans2Engine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IndicTrans2Engine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = SimpleIndicProcessor()
        self.models = {
            "en-indic": "ai4bharat/indictrans2-en-indic-dist-200M",
            "indic-en": "ai4bharat/indictrans2-indic-en-dist-200M",
            "indic-indic": "ai4bharat/indictrans2-indic-indic-dist-320M"
        }
        self.loaded_models = {}
        self.loaded_tokenizers = {}
        log_with_prefix("IndicTrans2Engine", f"Initializing on {self.device}")
    
    def _postprocess_formatting(self, text: str) -> str:
        """Clean up spacing around punctuation while preserving structure"""
        # Fix spacing around common punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)  # Remove space before punctuation
        text = re.sub(r'([.,!?;:])([^\s])', r'\1 \2', text)  # Add space after punctuation if missing
        # Fix spacing around quotes
        text = re.sub(r'\s+(["\'])', r'\1', text)
        text = re.sub(r'(["\'])\s+', r'\1 ', text)
        return text

    def _get_model_key(self, src_lang: str, tgt_lang: str) -> str:
        if src_lang == "en":
            return "en-indic"
        elif tgt_lang == "en":
            return "indic-en"
        else:
            return "indic-indic"

    def _load_model(self, model_key: str):
        if model_key in self.loaded_models:
            return

        model_name = self.models.get(model_key)
        if not model_name:
            raise ValueError(f"No model found for key: {model_key}")

        token = os.getenv("HF_TOKEN")
        try:
            log_with_prefix("IndicTrans2Engine", f"Loading {model_name}...")
            tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True, token=token)
            model = AutoModelForSeq2SeqLM.from_pretrained(
                model_name, 
                trust_remote_code=True, 
                token=token
            ).to(self.device)
            
            self.loaded_tokenizers[model_key] = tokenizer
            self.loaded_models[model_key] = model
            log_with_prefix("IndicTrans2Engine", f"Successfully loaded {model_name}")
        except Exception as e:
            log_with_prefix("IndicTrans2Engine", f"Failed to load {model_name}: {e}", level="error")
            raise e

    def translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        if not text or src_lang == tgt_lang:
            return text

        src_code = INDIC_LANG_MAP.get(src_lang)
        tgt_code = INDIC_LANG_MAP.get(tgt_lang)

        if not src_code or not tgt_code:
            log_with_prefix("IndicTrans2Engine", f"Unsupported language: {src_lang} or {tgt_lang}", level="warning")
            return text

        model_key = self._get_model_key(src_lang, tgt_lang)
        self._load_model(model_key)
        
        model = self.loaded_models[model_key]
        tokenizer = self.loaded_tokenizers[model_key]

        try:
            log_with_prefix("IndicTrans2Engine", f"Translating: {src_code} -> {tgt_code}")
            
            # Preprocess
            processed_text = self.processor.preprocess(text, src_code, tgt_code)
            
            # Tokenize
            inputs = tokenizer(processed_text, return_tensors="pt").to(self.device)
            
            # Generate
            with torch.no_grad():
                generated_tokens = model.generate(
                    **inputs,
                    num_beams=5,
                    num_return_sequences=1,
                    max_length=256
                )
            
            # Decode
            outputs = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
            translated_text = outputs[0]
            
            # Postprocess: IndicTrans2 distilled models output Devanagari for most Indic languages.
            # We need to transliterate from Devanagari (hi) to the target native script.
            if tgt_lang != "en" and tgt_lang != "hi" and tgt_lang != "mr":
                try:
                    log_with_prefix("IndicTrans2Engine", f"Transliterating: hi -> {tgt_lang}")
                    translated_text = UnicodeIndicTransliterator.transliterate(translated_text, "hi", tgt_lang)
                except Exception as translit_err:
                    log_with_prefix("IndicTrans2Engine", f"Transliteration failed: {translit_err}", level="warning")
            
            # Postprocess: Clean up formatting (spacing around punctuation)
            translated_text = self._postprocess_formatting(translated_text)
            
            log_with_prefix("IndicTrans2Engine", f"Translation complete: '{translated_text[:30]}...'")
            return translated_text
            
        except Exception as e:
            log_with_prefix("IndicTrans2Engine", f"Translation failed: {e}", level="error")
            return text

# Global instance
indictrans_engine = IndicTrans2Engine()
