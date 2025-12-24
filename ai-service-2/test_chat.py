import requests
import json

def test_chat():
    url = "http://localhost:8001/chat"
    payload = {
        "conversation_id": "test_123",
        "message": "forecast for meter MTR001"
    }
    try:
        res = requests.post(url, json=payload)
        print(f"Status: {res.status_code}")
        print("Response:", json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_chat()
