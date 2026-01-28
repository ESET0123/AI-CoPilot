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
            log_with_prefix("XTTS", "WARN: TTS library not installed. XTTS v2 will be unavailable.")
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
        log_with_prefix("XTTS", f"INIT: Initializing XTTS v2 on {self.device}")
        
        try:
            # Apply monkey-patch just for the duration of model loading
            torch.load = patched_torch_load
            
            # Note: This model is ~2GB.
            self._model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(self.device)
            log_with_prefix("XTTS", "SUCCESS: XTTS v2 Model loaded successfully.")
            return True
        except Exception as e:
            log_with_prefix("XTTS", f"ERROR: Failed to load XTTS v2: {str(e)}", level="error")
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
            log_with_prefix("XTTS", "WARN: XTTS Model not available. Fallback required.")
            return None

        log_with_prefix("XTTS", f"INFO: [XTTS] Synthesizing text (Lang: {language})")
        
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
            
            log_with_prefix("XTTS", f"INFO: Using Voice: Multi-lingual ({target_lang})")
            
            # Use 'Ana Florence' as default, or any available speaker if missing
            available_speakers = []
            if hasattr(self._model, 'speakers'):
                available_speakers = self._model.speakers
            
            speaker_to_use = "Ana Florence"
            if available_speakers and speaker_to_use not in available_speakers:
                # If 'Ana Florence' is not found, use the first available one as fallback
                speaker_to_use = available_speakers[0]
                log_with_prefix("XTTS", f"WARN: 'Ana Florence' not found. Falling back to '{speaker_to_use}'")

            # Using tts_to_file with a reasonable default speaker
            self._model.tts_to_file(
                text=text,
                speaker_wav=None,
                speaker=speaker_to_use,
                language=target_lang,
                file_path=temp_wav
            )
            
            log_with_prefix("XTTS", f"SUCCESS: Success! WAV size: {os.path.getsize(temp_wav)} bytes")
            return temp_wav

        except Exception as e:
            # Use repr(e) to avoid encoding issues with the error message itself on Windows
            log_with_prefix("XTTS", f"ERROR: XTTS synthesis failed: {repr(e)}", level="error")
            return None

# Global instance
xtts_engine = XTTSEngine()
