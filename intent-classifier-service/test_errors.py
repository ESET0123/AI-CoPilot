import requests
import json
import logging

# Configure minimal logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TEST_ERRORS")

BASE_URL = "http://localhost:8002/api/process"

def test_query(label, query):
    logger.info(f"--- TEST: {label} ---")
    try:
        resp = requests.post(BASE_URL, json={"query": query}, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            intent = data.get("intent")
            fulfillment = data.get("fulfillment")
            logger.info(f"Status: 200 OK")
            logger.info(f"Intent: {intent}")
            logger.info(f"Fulfillment: {fulfillment}")
            
            if intent == "OTHER" and label == "Ambiguous Query":
                logger.info("PASS: Ambiguous query correctly identified as OTHER.")
            elif intent == "LOAD_FORECASTING" and label == "Valid Query":
                 logger.info("PASS: Valid query correctly identified.")
            else:
                 logger.info("OBSERVATION: Check if this intent is expected.")
                 
        else:
            logger.error(f"Status: {resp.status_code}")
            logger.error(f"Body: {resp.text}")
            
    except Exception as e:
        logger.error(f"Request Failed: {e}")

if __name__ == "__main__":
    # Test 1: Valid Query
    test_query("Valid Query", "What is the load forecast for tomorrow?")
    
    # Test 2: Ambiguous/Garbage Query to trigger OTHER
    test_query("Ambiguous Query", "fsdjklfjdslk fjdslk")
    
    # Test 3: SQL Injection-like (Self-protection check)
    test_query("Injection Attempt", "DROP TABLE users;")
    
    # Test 4: Extremely Long Query (Ollama limit check)
    test_query("Long Query", "load " * 500)
    
