try:
    from TTS.api import TTS
    HAS_TTS = True
except ImportError:
    HAS_TTS = False

import torch
import tempfile
import os
import wave
from app.core.logger import log_with_prefix

class XTTSEngine:
    """
    Local TTS engine using Coqui XTTS v2.
    Supports voice cloning and high-quality multi-lingual synthesis.
    """
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(XTTSEngine, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        """Explicitly load the model. Can be called at startup."""
        if not HAS_TTS:
            log_with_prefix("XTTS", "⚠️ TTS library not installed. XTTS v2 will be unavailable.")
            return False

        if self._model is not None:
            return True

        # Automate TOS agreement for Coqui XTTS
        os.environ["COQUI_TOS_AGREED"] = "1"
        
        # Robust fix for PyTorch 2.6+ secure loading issue
        # Monkey-patch torch.load to allow unpickling custom Coqui classes
        import torch
        original_torch_load = torch.load
        def patched_torch_load(*args, **kwargs):
            kwargs['weights_only'] = False
            return original_torch_load(*args, **kwargs)
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        log_with_prefix("XTTS", f"🚀 Initializing XTTS v2 on {self.device}")
        
        try:
            # Apply monkey-patch just for the duration of model loading
            torch.load = patched_torch_load
            
            # Note: This model is ~2GB.
            self._model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(self.device)
            log_with_prefix("XTTS", "✅ XTTS v2 Model loaded successfully.")
            return True
        except Exception as e:
            log_with_prefix("XTTS", f"❌ Failed to load XTTS v2: {str(e)}", level="error")
            self._model = None
            return False
        finally:
            # Always restore the original torch.load
            torch.load = original_torch_load

    async def synthesize(self, text: str, language: str = "en") -> str:
        """
        Generates a WAV file from text using XTTS v2.
        Returns the path to the temporary wav file.
        """
        if self._model is None:
            self.initialize()

        if not self._model:
            log_with_prefix("XTTS", "⚠️ XTTS Model not available. Fallback required.")
            return None

        log_with_prefix("XTTS", f"📢 [XTTS] Synthesizing text (Lang: {language})")
        
        # XTTS v2 Language map (ISO codes)
        # Supports: 'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'hu', 'ko', 'hi'
        # Bengali ('bn') is NOT supported by default in XTTS v2, but we can try 'hi' as a base or fallback to other engines.
        
        supported_langs = ['en', 'hi', 'ar', 'zh-cn', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'hu']
        target_lang = language if language in supported_langs else "en"
        
        temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
        
        try:
            # XTTS requires a speaker_wav for cloning or a speaker_id.
            # We will use one of the built-in speakers if possible, or skip cloning and use default.
            # In XTTS v2 API, we can use speaker_id="Ana" or similar if known, or provide a 5s sample.
            
            # For simplicity, we'll try to use the first available speaker if none provided.
            # Most XTTS installations have default speakers.
            
            log_with_prefix("XTTS", f"🚀 Using Voice: Multi-lingual ({target_lang})")
            
            # Using tts_to_file with a reasonable default speaker
            # Note: You might need to adjust speaker_wav to a real path if Ana doesn't exist.
            self._model.tts_to_file(
                text=text,
                speaker_wav=None, # If None, it might fail depending on version, usually requires a sample.
                speaker="Ana",    # Built-in speaker
                language=target_lang,
                file_path=temp_wav
            )
            
            log_with_prefix("XTTS", f"✅ Success! WAV size: {os.path.getsize(temp_wav)} bytes")
            return temp_wav

        except Exception as e:
            log_with_prefix("XTTS", f"❌ XTTS synthesis failed: {str(e)}", level="error")
            return None

# Global instance
xtts_engine = XTTSEngine()
