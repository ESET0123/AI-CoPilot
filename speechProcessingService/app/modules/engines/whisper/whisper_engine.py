import os
import sys
from faster_whisper import WhisperModel
from app.core.logger import log_with_prefix

class WhisperEngine:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WhisperEngine, cls).__new__(cls)
        return cls._instance

    def initialize(self, model_name: str = "large-v3", device: str = "cpu", compute_type: str = "int8"):
        if self._model is None:
            log_with_prefix("WhisperEngine", f"🚀 Loading Whisper model: {model_name} on {device}...")
            
            # Check for custom model path
            script_dir = os.path.dirname(os.path.abspath(__file__))
            potential_model_path = os.path.join(script_dir, "..", "..", "..", "models", f"whisper-{model_name}")
            
            if os.path.exists(potential_model_path):
                model_name = potential_model_path
                log_with_prefix("WhisperEngine", f"📂 Using local model path: {model_name}")

            try:
                self._model = WhisperModel(model_name, device=device, compute_type=compute_type)
                log_with_prefix("WhisperEngine", "✅ Model loaded successfully")
            except Exception as e:
                log_with_prefix("WhisperEngine", f"❌ Failed to load model: {str(e)}", level="error")
                raise e

    def transcribe(self, file_path: str, language: str = None, task: str = "transcribe"):
        if self._model is None:
            self.initialize()

        log_with_prefix("WhisperEngine", f"🎤 Transcribing {os.path.basename(file_path)} (Lang: {language}, Task: {task})")
        
        params = {
            "beam_size": 5,
            "task": task,
            "condition_on_previous_text": False
        }
        
        if language and language != "auto":
            params["language"] = language
            
            # Adding priming prompts for Indian languages
            prompts = {
                "hi": "नमस्ते, आप कैसे हैं? आज मौसम बहुत अच्छा है। मुझे हिंदी में बात करना पसंद है।",
                # "bn": "নমস্কার, আপনি কেমন আছেন? আজ আবহাওয়া খুব ভালো। আমি বাংলা বলতে ভালোবাসি।",
                # "ta": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்? தமிழ் மிகவும் அழகான மொழி.",
                # "te": "నమస్కారం, మీరు ఎలా ఉన్నారు? తెలుగు భాష చాలా బాగుంటుంది.",
                # "mr": "नमस्कार, तुम्ही कसे आहात? मराठी माझी मातृभाषा आहे.",
                # "gu": "નમસ્તે, તમે કેમ છો? ગુજરાતી મીઠી భాష છે.",
                # "kn": "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ? ಕನ್ನಡ ನಾಡು ಸುಂದರವಾಗಿದೆ.",
                # "ml": "നമസ്കാരം, സുুখമാണോ? മലയാളം മനോഹരമായ భాషയാണ്.",
                # "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ? ਪੰਜਾਬੀ ਬਹੁਤ ਵਧੀਆ ਭਾਸ਼ਾ ਹੈ।",
            }
            if language in prompts:
                params["initial_prompt"] = prompts[language]

        segments, info = self._model.transcribe(file_path, **params)
        
        text = " ".join([segment.text for segment in segments]).strip()
        
        return {
            "text": text,
            "detected_language": info.language,
            "language_probability": info.language_probability
        }

# Global instance
whisper_engine = WhisperEngine()
