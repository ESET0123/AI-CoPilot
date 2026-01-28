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
        Uses the global singleton instance.
        """
        return await intent_classifier.classify(query)

# Global singleton instance
intent_classifier = IntentClassifier()
