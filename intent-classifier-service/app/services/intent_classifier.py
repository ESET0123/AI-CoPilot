import json
import re
import httpx
from app.core.constants import Intent
from app.core.config import settings
from app.core.logger import log_with_prefix

class IntentClassifier:
    """Classifies user queries into predefined intents using LLM"""

    @staticmethod
    async def classify(query: str) -> Intent:
        log_with_prefix("Intent Classifier", f"Classifying: '{query}'")
        
        prompt = f"""You are an intent classifier for an energy grid system.

            Allowed intents:
            - LOAD_FORECASTING: Questions about load forecast,  power demand, load predictions, consumption forecasts, energy usage
            - THEFT_DETECTION: Questions about theft, theft alerts, suspicious activity, anomaly detection, fraud detection
            - OTHER: Everything else

            Examples:
            - "What is the load forecast for tomorrow?" -> LOAD_FORECASTING
            - "Show me power demand for next week" -> LOAD_FORECASTING
            - "Any theft detected?" -> THEFT_DETECTION
            - "Show me theft alerts" -> THEFT_DETECTION
            - "Hello how are you?" -> OTHER

            Respond ONLY in JSON format:
            {{"intent": "<INTENT>"}}

            Query: {query}
            """

        try:
            log_with_prefix("Intent Classifier", f"Calling Ollama ({settings.OLLAMA_MODEL})...")
            
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(
                    settings.OLLAMA_API,
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.1}
                    }
                )
            
            raw_response = resp.json().get("response", "")
            log_with_prefix("Intent Classifier", f"RAW LLM OUTPUT: {raw_response}")

            # Clean and normalize the response
            clean_response = raw_response.replace("```json", "").replace("```", "").strip()
            
            intent_str = "OTHER"
            
            # Try JSON extraction first
            match = re.search(r"\{.*\}", clean_response, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    intent_str = data.get("intent", "OTHER")
                except json.JSONDecodeError:
                    log_with_prefix("Intent Classifier", "JSON decode error, falling back to regex")

            # If JSON fail or no intent found, try direct regex on the value
            if intent_str == "OTHER":
                # Look for patterns like "intent": "VAL" or similar
                val_match = re.search(r"\"intent\"\s*:\s*\"([^\"]+)\"", clean_response, re.IGNORECASE)
                if val_match:
                    intent_str = val_match.group(1)

            # Normalize: uppercase, underscores instead of spaces/hyphens
            normalized = intent_str.upper().replace(" ", "_").replace("-", "_").strip()
            
            # Final attempt to match enum
            try:
                # Direct match
                intent = Intent(normalized)
            except ValueError:
                # Substring match (e.g. if it returns "THEFT DETECTION")
                if "THEFT" in normalized:
                    intent = Intent.THEFT_DETECTION
                elif "LOAD" in normalized or "FORECAST" in normalized:
                    intent = Intent.LOAD_FORECASTING
                else:
                    log_with_prefix("Intent Classifier", f"Could not map '{normalized}' to Intent Enum. Using OTHER.")
                    intent = Intent.OTHER
            
            log_with_prefix("Intent Classifier", f"Result: {intent.value}")
            return intent

        except httpx.ConnectError:
            log_with_prefix("Intent Classifier", "❌ Could not connect to Ollama. Is it running?", level="error")
            log_with_prefix("Intent Classifier", "👉 Run 'ollama serve' in your terminal.", level="error")
            return Intent.OTHER
        except Exception as e:
            log_with_prefix("Intent Classifier", f"❌ Classification error: {e}", level="error")
            # Fallback to keyword matching if LLM completely fails
            if "theft" in query.lower():
                return Intent.THEFT_DETECTION
            if "load" in query.lower() or "forecast" in query.lower():
                return Intent.LOAD_FORECASTING
            return Intent.OTHER