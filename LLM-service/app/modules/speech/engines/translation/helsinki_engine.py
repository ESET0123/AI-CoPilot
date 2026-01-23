import torch
from transformers import MarianMTModel, MarianTokenizer
from app.core.logger import log_with_prefix
import os

class HelsinkiEngine:
    _instances = {}
    
    @classmethod
    def get_instance(cls, source_lang: str, target_lang: str):
        key = f"{source_lang}-{target_lang}"
        if key not in cls._instances:
            cls._instances[key] = cls(source_lang, target_lang)
        return cls._instances[key]

    def __init__(self, source_lang: str, target_lang: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.src = source_lang
        self.tgt = target_lang
        
        # Helsinki models are usually named opus-mt-src-tgt
        # e.g., opus-mt-en-ar, opus-mt-ar-en
        model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
        
        log_with_prefix("HelsinkiEngine", f"Loading model: {model_name} on {self.device}")
        try:
            self.tokenizer = MarianTokenizer.from_pretrained(model_name)
            self.model = MarianMTModel.from_pretrained(model_name).to(self.device)
            log_with_prefix("HelsinkiEngine", f"✅ Model loaded: {model_name}")
        except Exception as e:
            log_with_prefix("HelsinkiEngine", f"❌ Failed to load {model_name}: {e}", level="error")
            raise e

    def translate(self, text: str) -> str:
        if not text:
            return ""
            
        try:
            # Tokenize
            log_with_prefix("HelsinkiEngine", f"⚙️ Tokenizing input: '{text[:30]}...'")
            batch = self.tokenizer([text], return_tensors="pt", padding=True).to(self.device)
            
            # Generate
            log_with_prefix("HelsinkiEngine", "🔄 Generating translation...")
            gen = self.model.generate(**batch)
            
            # Decode
            translated = self.tokenizer.batch_decode(gen, skip_special_tokens=True)
            log_with_prefix("HelsinkiEngine", f"✅ Translation complete: '{translated[0][:30]}...'")
            return translated[0]
            
        except Exception as e:
            log_with_prefix("HelsinkiEngine", f"❌ Translation failed: {e}", level="error")
            return text
