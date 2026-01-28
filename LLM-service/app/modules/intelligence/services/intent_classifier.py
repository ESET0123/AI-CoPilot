# import json
# import re
# import httpx
# from app.core.constants import Intent
# from app.core.config import settings
# from app.core.logger import log_with_prefix

# class IntentClassifier:
#     """Classifies user queries into predefined intents using LLM"""

#     @staticmethod
#     async def classify(query: str) -> Intent:
#         log_with_prefix("Intent Classifier", f"Classifying: '{query}'")
        
#         prompt = f"""You are an intent classifier for an energy grid system.

#             Allowed intents:
#             - LOAD_FORECASTING: Questions about load forecast,  power demand, load predictions, consumption forecasts, energy usage, holidays
#             - THEFT_DETECTION: Questions about theft, theft alerts, suspicious activity, anomaly detection, fraud detection
#             - ASSET_MONITORING: Questions about asset health, transformer status, meter data, transformer life, asset maintenance
#             - OTHER: Everything else

#             Examples:
#             - "What is the load forecast for tomorrow?" -> LOAD_FORECASTING
#             - "Show me power demand for next week" -> LOAD_FORECASTING
#             - "Any theft detected?" -> THEFT_DETECTION
#             - "Show me theft alerts" -> THEFT_DETECTION
#             - "Show me transformer health" -> ASSET_MONITORING
#             - "What is the status of the meters?" -> ASSET_MONITORING
#             - "Hello how are you?" -> OTHER

#             Respond ONLY in JSON format:
#             {{"intent": "<INTENT>"}}

#             Query: {query}
#             """

#         try:
#             log_with_prefix("Intent Classifier", f"Calling Ollama ({settings.OLLAMA_MODEL})...")
            
#             async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
#                 resp = await client.post(
#                     settings.OLLAMA_API,
#                     json={
#                         "model": settings.OLLAMA_MODEL,
#                         "prompt": prompt,
#                         "stream": False,
#                         "options": {"temperature": 0.1}
#                     }
#                 )
            
#             resp.raise_for_status()  # Raises HTTPStatusError for 4xx/5xx responses
#             raw_response = resp.json().get("response", "")
#             print(f"DEBUG: RAW LLM OUTPUT: {raw_response}")
#             log_with_prefix("Intent Classifier", f"RAW LLM OUTPUT: {raw_response}")

#             # Clean and normalize the response
#             clean_response = raw_response.replace("```json", "").replace("```", "").strip()
            
#             intent_str = "OTHER"
            
#             # Try JSON extraction first
#             match = re.search(r"\{.*\}", clean_response, re.DOTALL)
#             if match:
#                 try:
#                     data = json.loads(match.group())
#                     intent_str = data.get("intent", "OTHER")
#                 except json.JSONDecodeError:
#                     log_with_prefix("Intent Classifier", "JSON decode error, falling back to regex")

#             # If JSON fail or no intent found, try direct regex on the value
#             if intent_str == "OTHER":
#                 # Look for patterns like "intent": "VAL" or similar
#                 val_match = re.search(r"\"intent\"\s*:\s*\"([^\"]+)\"", clean_response, re.IGNORECASE)
#                 if val_match:
#                     intent_str = val_match.group(1)

#             # Normalize: uppercase, underscores instead of spaces/hyphens
#             normalized = intent_str.upper().replace(" ", "_").replace("-", "_").strip()
            
#             # Final attempt to match enum
#             try:
#                 # Direct match
#                 intent = Intent(normalized)
#             except ValueError:
#                 # Substring match (e.g. if it returns "THEFT DETECTION")
#                 if "THEFT" in normalized:
#                     intent = Intent.THEFT_DETECTION
#                 elif "LOAD" in normalized or "FORECAST" in normalized:
#                     intent = Intent.LOAD_FORECASTING
#                 elif "ASSET" in normalized or "MONITOR" in normalized:
#                     intent = Intent.ASSET_MONITORING
#                 else:
#                     log_with_prefix("Intent Classifier", f"Could not map '{normalized}' to Intent Enum. Using OTHER.")
#                     intent = Intent.OTHER
            
#             log_with_prefix("Intent Classifier", f"Result: {intent.value}")
#             return intent

#         except httpx.ConnectError:
#             log_with_prefix("Intent Classifier", "❌ Could not connect to Ollama. Is it running?", level="error")
#             log_with_prefix("Intent Classifier", "👉 Run 'ollama serve' in your terminal.", level="error")
#             return Intent.OTHER
#         except Exception as e:
#             log_with_prefix("Intent Classifier", f"❌ Classification error: {e}", level="error")
#             # Fallback to keyword matching if LLM completely fails
#             if "theft" in query.lower():
#                 return Intent.THEFT_DETECTION
#             if "load" in query.lower() or "forecast" in query.lower():
#                 return Intent.LOAD_FORECASTING
#             if any(word in query.lower() for word in ["asset", "monitor", "transformer", "meter"]):
#                 return Intent.ASSET_MONITORING
#             return Intent.OTHER

"""
Semantic Intent Classifier for Utility AI Co-Pilot
Uses HuggingFace embeddings for fast, offline classification
"""

import os
import numpy as np
from typing import Dict, List, Tuple

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.constants import Intent
from app.core.logger import log_with_prefix

# Disable CUDA for CPU-only inference
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"


class IntentClassifier:
    """Classifies user queries into predefined intents using semantic embeddings"""

    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

    # Example queries for each intent (used to build semantic index)
    INTENT_EXAMPLES: Dict[Intent, List[str]] = {
        Intent.LOAD_FORECASTING: [
            "Forecast electricity demand for next month",
            "Predict power consumption trends",
            "Load forecasting for summer season",
            "Expected demand during peak hours",
            "Energy demand prediction model",
            "Forecast future load requirements",
            "Anticipate consumption growth",
            "Demand projections for planning",
            "What is the load forecast for tomorrow?",
            "Show me power demand for next week",
            "Predict revenue for next quarter",
            "Forecast billing collections",
            "Revenue projections for the year",
            "Capacity planning for grid infrastructure",
            "Future capacity requirements",
        ],
        Intent.THEFT_DETECTION: [
            "Detect electricity theft in my region",
            "Identify abnormal consumption patterns",
            "Find customers with suspicious usage",
            "Meter tampering detection",
            "Unusual power consumption alerts",
            "Customers bypassing meters",
            "Detect unauthorized connections",
            "Flag anomalous consumption behavior",
            "Any theft detected?",
            "Show me theft alerts",
            "Analyze tariff violations",
            "Customers using wrong tariff category",
            "Commercial customer registered as residential",
            "Tariff classification misuse",
            "Analyze customer consumption patterns",
            "Show me consumption trends",
        ],
        Intent.ASSET_MONITORING: [
            "Check transformer remaining lifespan",
            "Transformer health assessment",
            "Predict transformer failure",
            "Remaining useful life of transformers",
            "Transformer condition monitoring",
            "When should we replace this transformer?",
            "Transformer aging analysis",
            "Expected lifespan of distribution transformers",
            "Show me transformer health",
            "What is the status of the meters?",
            "Monitor equipment condition",
            "Asset health status overall",
            "Equipment failure prediction",
            "Condition-based monitoring",
            "Schedule preventive maintenance",
            "Maintenance planning for assets",
        ],
    }

    def __init__(self):
        """Initialize embeddings model and pre-compute intent embeddings"""
        log_with_prefix("Intent Classifier", "Initializing semantic classifier...")
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

        # Pre-compute embeddings for all intent examples
        self.intent_embeddings: Dict[Intent, List[np.ndarray]] = {}
        self._precompute_embeddings()
        
        log_with_prefix("Intent Classifier", "Semantic classifier initialized successfully")

    def _precompute_embeddings(self):
        """Pre-compute embeddings for all intent examples"""
        for intent, examples in self.INTENT_EXAMPLES.items():
            embeddings = self.embeddings.embed_documents(examples)
            self.intent_embeddings[intent] = [np.array(e) for e in embeddings]
        log_with_prefix("Intent Classifier", f"Pre-computed embeddings for {len(self.INTENT_EXAMPLES)} intents")

    async def classify(self, query: str, threshold: float = 0.35) -> Intent:
        """
        Classify user query into an Intent using semantic similarity.

        Args:
            query: The user's input query
            threshold: Minimum similarity score to match an intent (default 0.35)

        Returns:
            Intent enum value (LOAD_FORECASTING, THEFT_DETECTION, ASSET_MONITORING, or OTHER)
        """
        log_with_prefix("Intent Classifier", f"Classifying: '{query}'")

        # Embed the query
        query_embedding = np.array(self.embeddings.embed_query(query))

        # Calculate similarity scores for each intent
        intent_scores: Dict[Intent, float] = {}

        for intent, example_embeddings in self.intent_embeddings.items():
            # Compute cosine similarity with each example
            similarities = [np.dot(query_embedding, example_emb) for example_emb in example_embeddings]
            # Use max similarity as the score for this intent
            intent_scores[intent] = max(similarities)

        # Find best matching intent
        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        matched_intent, confidence = best_intent

        log_with_prefix(
            "Intent Classifier",
            f"Best match: {matched_intent.value} (confidence: {confidence:.3f})"
        )

        # Check if confidence meets threshold
        if confidence < threshold:
            log_with_prefix(
                "Intent Classifier",
                f"Confidence {confidence:.3f} below threshold {threshold}. Returning OTHER."
            )
            return Intent.OTHER

        log_with_prefix("Intent Classifier", f"Result: {matched_intent.value}")
        return matched_intent

    @staticmethod
    async def classify_static(query: str) -> Intent:
        """
        Static method for backward compatibility.
        Note: Creates a new classifier instance each call - prefer using instance method.
        """
        classifier = IntentClassifier()
        return await classifier.classify(query)

# Global singleton instance
intent_classifier = IntentClassifier()
