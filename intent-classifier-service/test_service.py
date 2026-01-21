import requests
import json

url = "http://localhost:8002/api/classify"

tests = [
    {"query": "What is the forecasted load for tomorrow?", "expected": "LOAD_FORECASTING"},
    {"query": "Show me theft alerts", "expected": "THEFT_DETECTION"},
    {"query": "Hello, how are you?", "expected": "OTHER"}
]

for test in tests:
    print(f"Testing: {test['query']}")
    try:
        response = requests.post(url, json={"query": test['query']})
        if response.status_code == 200:
            result = response.json()
            intent = result.get('intent')
            print(f"  Result: {intent} (Expected: {test['expected']})")
            if intent == test['expected']:
                print("  STATUS: PASS")
            else:
                print("  STATUS: FAIL")
        else:
            print(f"  Failed with status code: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"  Error: {e}")
    print("-" * 20)
