import os
import requests

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

def call_ollama(model, system, user):
    url = f"{OLLAMA_BASE}/api/generate"

    payload = {
        "model": model,
        "prompt": f"{system}\n\nUser request:\n{user}\n\nResponse:",
        "stream": False
    }

    r = requests.post(url, json=payload, timeout=300)

    if r.status_code != 200:
        raise Exception(f"Ollama error {r.status_code}: {r.text}")

    return r.json()["response"].strip()
