import httpx
from app.core.logger import log_with_prefix
import os

class SpeechServiceClient:
    """
    Client for communicating with the standalone speechProcessingService.
    """
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv("SPEECH_SERVICE_URL", "http://localhost:8003/api")
        self.timeout = 30.0

    async def translate(self, text: str, from_lang: str, to_lang: str = "en") -> str:
        """Calls the speech processing service to translate text."""
        if not text or from_lang == to_lang:
            return text
            
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/translation/translate",
                    json={
                        "text": text,
                        "from_lang": from_lang,
                        "to_lang": to_lang
                    }
                )
                response.raise_for_status()
                return response.json()["translated_text"]
        except Exception as e:
            log_with_prefix("SpeechClient", f"⚠️ Translation request failed: {e}", level="warning")
            return text

speech_client = SpeechServiceClient()
