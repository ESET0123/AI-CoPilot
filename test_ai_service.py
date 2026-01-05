import requests
import json

url = "http://127.0.0.1:8001/api/chat"
payload = {
    "message": "hello",
    "model_type": "local",
    "user_role": "admin"
}

try:
    response = requests.post(url, json=payload, timeout=30)
    print("Status Code:", response.status_code)
    print("Response JSONKeys:", response.json().keys() if response.status_code == 200 else "N/A")
    print("Response Content:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
