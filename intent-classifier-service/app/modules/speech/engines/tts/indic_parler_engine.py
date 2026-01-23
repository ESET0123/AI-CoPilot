import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
import tempfile
import os
from app.core.logger import log_with_prefix

class IndicParlerEngine:
    _instance = None
    _model = None
    _tokenizer = None
    _description_tokenizer = None
    _device = "cuda" if torch.cuda.is_available() else "cpu"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IndicParlerEngine, cls).__new__(cls)
        return cls._instance

    def initialize(self, model_name: str = "ai4bharat/indic-parler-tts"):
        if self._model is None:
            log_with_prefix("IndicParler", f"🚀 Loading model {model_name} on {self._device}...")
            try:
                self._model = ParlerTTSForConditionalGeneration.from_pretrained(model_name).to(self._device)
                self._tokenizer = AutoTokenizer.from_pretrained(model_name)
                self._description_tokenizer = AutoTokenizer.from_pretrained(model_name)
                log_with_prefix("IndicParler", "✅ Model loaded successfully")
            except Exception as e:
                log_with_prefix("IndicParler", f"❌ Failed to load model: {str(e)}", level="error")
                raise e

    def synthesize(self, text: str, description: str = "A male speaker with a clear and high-quality voice delivers the speech at a natural pace.") -> str:
        if self._model is None:
            self.initialize()

        log_with_prefix("IndicParler", f"📢 Synthesizing: {text[:50]}...")
        
        try:
            input_ids = self._description_tokenizer(description, return_tensors="pt").input_ids.to(self._device)
            prompt_input_ids = self._tokenizer(text, return_tensors="pt").input_ids.to(self._device)

            generation = self._model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)
            audio_arr = generation.cpu().numpy().squeeze()

            temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
            sf.write(temp_wav, audio_arr, self._model.config.sampling_rate)
            
            log_with_prefix("IndicParler", f"✅ Success! WAV saved to {temp_wav}")
            return temp_wav
        except Exception as e:
            log_with_prefix("IndicParler", f"❌ Synthesis failed: {str(e)}", level="error")
            return None

# Global instance
indic_parler_engine = IndicParlerEngine()
