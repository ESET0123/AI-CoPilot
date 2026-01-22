"""
Test script to verify intent classification is working correctly

Run this after starting the server:
python test_intents.py
"""

import requests
import json

API_URL = "http://localhost:8002/api/process"

# Test cases with expected intents
TEST_CASES = [
    # LOAD_FORECASTING cases
    {
        "query": "What is the load forecast for tomorrow?",
        "expected": "LOAD_FORECASTING"
    },
    {
        "query": "Show me power demand for next week",
        "expected": "LOAD_FORECASTING"
    },
    {
        "query": "Predict energy consumption",
        "expected": "LOAD_FORECASTING"
    },
    
    # THEFT_DETECTION cases
    {
        "query": "Any theft detected?",
        "expected": "THEFT_DETECTION"
    },
    {
        "query": "Show me theft alerts",
        "expected": "THEFT_DETECTION"
    },
    {
        "query": "Are there any suspicious activities?",
        "expected": "THEFT_DETECTION"
    },
    {
        "query": "Detect fraud in the system",
        "expected": "THEFT_DETECTION"
    },
    
    # OTHER cases
    {
        "query": "Hello, how are you?",
        "expected": "OTHER"
    },
    {
        "query": "What's the weather today?",
        "expected": "OTHER"
    },
]

def test_intent_classification():
    print("\n" + "=" * 80)
    print("TESTING INTENT CLASSIFICATION")
    print("=" * 80 + "\n")
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(TEST_CASES, 1):
        query = test["query"]
        expected = test["expected"]
        
        print(f"Test {i}/{len(TEST_CASES)}: {query}")
        
        try:
            response = requests.post(
                API_URL,
                json={"query": query},
                timeout=20
            )
            
            data = response.json()
            actual = data.get("intent")
            
            if actual == expected:
                print(f"  ✓ PASS - Intent: {actual}")
                passed += 1
            else:
                print(f"  ✗ FAIL - Expected: {expected}, Got: {actual}")
                failed += 1
                
        except Exception as e:
            print(f"  ✗ ERROR - {str(e)}")
            failed += 1
        
        print()
    
    print("=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(TEST_CASES)} tests")
    print("=" * 80 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    success = test_intent_classification()
    exit(0 if success else 1)