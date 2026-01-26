import requests
import logging
from config import settings

logger = logging.getLogger("AssetMonitoringService.LLMClient")

def call_ollama(model: str, system: str, user: str):
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    logger.info(f"Calling Ollama at {url} with model {model} (timeout={settings.OLLAMA_TIMEOUT}s)")
    payload = {
        "model": model,
        "prompt": f"{system}\n\nUser request:\n{user}\n\nResponse:",
        "stream": False
    }
    try:
        r = requests.post(url, json=payload, timeout=settings.OLLAMA_TIMEOUT)
        if r.status_code != 200:
            logger.error(f"Ollama error {r.status_code}: {r.text}")
            raise Exception(f"Ollama error {r.status_code}: {r.text}")
        logger.info("Ollama call successful")
        return r.json()["response"].strip()
    except Exception as e:
        logger.exception("LLM Call Failed")
        raise Exception(f"LLM Call Failed: {e}")
