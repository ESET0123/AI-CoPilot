import os
import subprocess
import tempfile
import shutil
import wave
import sys
import httpx
from app.core.logger import log_with_prefix

class PiperEngine:
    """
    On-prem TTS engine using Piper.
    Piper is fast, local, and supports many regional Indian languages.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PiperEngine, cls).__new__(cls)
        return cls._instance

    async def synthesize(self, text: str, language: str = "en") -> str:
        """
        Generates a WAV file from text.
        Returns the path to the temporary wav file.
        """
        log_with_prefix("TTS", f"📢 [V5] Synthesizing text (Lang: {language})")
        
        # Mapping to Piper voice files
        voice_map = {
            "en": "en_US-lessac-medium.onnx",
            "hi": "hi_IN-pratham-medium.onnx",
            # "kn": "kn_IN-shreyas-medium.onnx",
            # "ar": "ar_JO-kareem-medium.onnx"
        }
        
        voice = voice_map.get(language, voice_map["en"])
        temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
        
        try:
            # 1. Ensure model exists (Download if missing)
            model_path = await self._ensure_model(voice, language)
            
            if not model_path:
                log_with_prefix("TTS", f"❌ Failed to obtain model: {voice}")
                return self._return_silent_wav(temp_wav)

            # 2. Check for required JSON config
            config_path = model_path + ".json"
            if not os.path.exists(config_path):
                log_with_prefix("TTS", f"❌ [CRITICAL] Missing config file: {config_path}")
                return self._return_silent_wav(temp_wav)

            # 3. Find Piper binary
            piper_path = shutil.which("piper")
            if not piper_path and os.path.exists(r"C:\piper\piper.exe"):
                piper_path = r"C:\piper\piper.exe"
            
            if not piper_path:
                log_with_prefix("TTS", "❌ Piper binary NOT FOUND")
                return self._return_silent_wav(temp_wav)

            # 4. Use subprocess
            cmd = [piper_path, "--model", model_path, "--output_file", temp_wav]
            log_with_prefix("TTS", f"🚀 Running: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd, 
                input=text.encode('utf-8'),
                capture_output=True, 
                check=False
            )
            
            if result.returncode == 0:
                log_with_prefix("TTS", f"✅ Success! WAV size: {os.path.getsize(temp_wav)} bytes")
            else:
                log_with_prefix("TTS", f"❌ Piper error: {result.stderr.decode()}", level="error")
                return self._return_silent_wav(temp_wav)
                    
            return temp_wav

        except Exception as e:
            log_with_prefix("TTS", f"❌ Synthesis failed: {str(e)}", level="error")
            return self._return_silent_wav(temp_wav)

    async def _ensure_model(self, voice: str, language: str) -> str:
        """Checks if model exists, downloads if missing to C:\\piper"""
        target_dir = r"C:\piper"
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
            
        model_path = os.path.join(target_dir, voice)
        if os.path.exists(model_path):
            return model_path

        log_with_prefix("TTS", f"📥 Model {voice} missing, attempting to download...")
        
        # Construct download URL (Rhasspy Piper Voices)
        # e.g. ur_PK-ispeech-medium.onnx -> ur/ur_PK/ispeech/medium/ur_PK-ispeech-medium.onnx
        try:
            parts = voice.replace(".onnx", "").split("-")
            lang_code = parts[0] # ur_PK
            simple_lang = lang_code.split("_")[0] # ur
            voice_name = parts[1] # ispeech
            quality = parts[2] # medium
            
            base_url = f"https://huggingface.co/rhasspy/piper-voices/resolve/main/{simple_lang}/{lang_code}/{voice_name}/{quality}/{voice}"
            
            async with httpx.AsyncClient() as client:
                # 1. Download ONNX
                log_with_prefix("TTS", f"Downloading {voice} from Hugging Face...")
                r = await client.get(base_url, follow_redirects=True, timeout=60.0)
                r.raise_for_status()
                with open(model_path, "wb") as f:
                    f.write(r.content)
                
                # 2. Download JSON Config
                log_with_prefix("TTS", f"Downloading {voice}.json...")
                r = await client.get(base_url + ".json", follow_redirects=True, timeout=30.0)
                r.raise_for_status()
                with open(model_path + ".json", "wb") as f:
                    f.write(r.content)
                
            log_with_prefix("TTS", f"✅ Model downloaded to {model_path}")
            return model_path
        except Exception as e:
            log_with_prefix("TTS", f"❌ Failed to download model: {str(e)}", level="error")
            return None

    def _return_silent_wav(self, path: str) -> str:
        """Returns a silent WAV file as a fallback"""
        log_with_prefix("TTS", "⚠️ Returning silent fallback WAV")
        with wave.open(path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(8000)
            wav_file.writeframes(b'\x00' * 16000)
        return path

# Global instance
tts_engine = PiperEngine()
