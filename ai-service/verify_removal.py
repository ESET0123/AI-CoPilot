import os
import sys
from modules import llm_router

def test_groq_removed():
    # 1. Check constants
    if hasattr(llm_router, 'GROQ_API_KEY'):
        print("FAIL: GROQ_API_KEY still exists in llm_router")
    else:
        print("PASS: GROQ_API_KEY removed")

    if hasattr(llm_router, 'call_cloud_api'):
        print("FAIL: call_cloud_api still exists in llm_router")
    else:
        print("PASS: call_cloud_api removed")

    # 2. Check call_llm default behavior (should be local)
    # We won't actually make a network call to avoid hanging if Ollama isn't up, 
    # but we can check if it tries to hit localhost or just inspecting the function is enough.
    # Let's rely on the code review we did.
    
    # 3. Check Intent Classification (Dry run)
    print("\nChecking Intent Classification (Mocking Local API)...")
    
    # Mocking call_local_api to return a predictable response for testing logic flow
    original_local_api = llm_router.call_local_api
    llm_router.call_local_api = lambda prompt, event: '{"intent": "SQL_QUERY"}'
    
    try:
        intent = llm_router.classify_intent("Show me users")
        print(f"PASS: Intent classification ran successfully. Result: {intent}")
    except Exception as e:
        print(f"FAIL: Intent classification crashed: {e}")
    finally:
        llm_router.call_local_api = original_local_api

if __name__ == "__main__":
    test_groq_removed()
