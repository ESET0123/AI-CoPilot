from config import settings
import requests

def call_ollama(model, system, user):
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"

    payload = {
        "model": model,
        "prompt": f"{system}\n\nUser request:\n{user}\n\nResponse:",
        "stream": False
    }

    try:
        r = requests.post(url, json=payload, timeout=300)
        if r.status_code != 200:
            raise Exception(f"Ollama error {r.status_code}: {r.text}")
        return r.json()["response"].strip()
    except Exception as e:
        raise Exception(f"LLM Call Failed: {e}")
