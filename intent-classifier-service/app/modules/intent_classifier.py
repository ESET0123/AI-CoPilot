import requests
import json
import re
import logging
from app.core.config import settings

logger = logging.getLogger("INTENT_SERVICE")

# Configuration for Ollama
OLLAMA_API = "http://localhost:11434/api/generate"
# Model specified by user
LOCAL_MODEL = "gemma3:12b"

class IntentClassifier:
    
    @staticmethod
    def call_ollama(prompt):
        """
        Calls Ollama running locally.
        """
        try:
            payload = {
                "model": LOCAL_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1}
            }
            r = requests.post(OLLAMA_API, json=payload, timeout=30)
            
            if r.status_code != 200:
                logger.error(f"Ollama API Error: {r.text}")
                return None
                
            return r.json().get('response')
        except Exception as e:
            logger.error(f"Ollama Connection Error: {e}")
            return None

    @staticmethod
    def classify_intent(query):
        """
        Classifies the user intent into specific categories:
        - LOAD_FORECASTING
        - THEFT_DETECTION
        - OTHER (Unknown/General)
        """
        
        prompt = f"""
        You are an advanced intent classifier for an energy grid management system.
        
        Analyze the following user query and classify it into exactly ONE of these categories:
        
        1. "LOAD_FORECASTING": 
           - Queries about future power/load/energy consumption or demand.
           - Examples: "What will be the load tomorrow?", "Predict next week's usage", "Future demand", "Forecasting".
           
        2. "THEFT_DETECTION":
           - Queries about power theft, fraud, tampering, or suspicious activities.
           - Examples: "Any theft detected?", "Show me suspicious meters", "Theft report", "Tampering alerts".
           
        3. "OTHER":
           - Any query that does not fit the above two categories.
           - Examples: "Hello", "How are you?", "System status".
           
        Output JSON ONLY in this format: {{"intent": "CATEGORY_NAME"}}
        
        Query: {query}
        """
        
        response = IntentClassifier.call_ollama(prompt)
        
        if not response:
            return "OTHER"
            
        try:
            # Extract JSON from response (handling potential markdown)
            json_match = re.search(r"\{.*\}", response.strip(), re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                intent = data.get("intent", "OTHER")
                
                # Validate intent
                if intent in ["LOAD_FORECASTING", "THEFT_DETECTION", "OTHER"]:
                    return intent
                    
            logger.warning(f"Could not parse intent from response: {response}")
            return "OTHER"
            
        except Exception as e:
            logger.error(f"Error parsing intent: {e}")
            return "OTHER"
