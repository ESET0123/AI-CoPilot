import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

from app.services.intent_classifier import IntentClassifier

async def test():
    print("--- STARTING DIRECT LLM TEST ---\n")
    
    queries = [
        "What is the load forecast for tomorrow?",
        "Any theft detected?",
        "Hello",
        "load-forecasting check",
        "power demand forecast"
    ]
    
    for q in queries:
        print(f"\nQuery: {q}")
        intent = await IntentClassifier.classify(q)
        print(f"Final Intent: {intent}")

if __name__ == "__main__":
    try:
        asyncio.run(test())
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
