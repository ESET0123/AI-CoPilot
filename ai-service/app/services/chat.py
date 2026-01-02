import json
import pandas as pd
import numpy as np
import plotly.express as px
from typing import Dict, Any, Tuple
from datetime import datetime

# Import existing modules
# We need to ensure the python path fits, but since `modules` is in the root of `ai-service`, 
# and we will run from `ai-service` root, this import should work if we adjust sys.path or if run as module.
# However, standard imports in a package structure are tricky if 'modules' is outside 'app'.
# We will assume 'modules' is a sibling to 'app' or we fix imports in main shim.
# For now, let's assume we can import from modules.
import sys
import os

# Ensure root dir is in path for 'modules' import
current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from modules import llm_router, db_manager, forecasting_engine
from app.core.logging import logger

class CustomEncoder(json.JSONEncoder):
    """
    Handles serialization of NumPy/Pandas objects.
    """
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

class ChatService:
    @staticmethod
    def generate_plotly_json(df: pd.DataFrame, insight: Dict[str, Any]) -> str | None:
        vt = insight.get("visualization_type")
        x_col = insight.get("x_column")
        y_col = insight.get("y_column")

        if df.empty or not x_col or not y_col:
            return None

        try:
            if x_col not in df.columns or y_col not in df.columns:
                return None

            if vt == "line":
                fig = px.line(df, x=x_col, y=y_col, template="plotly_dark")
            elif vt == "bar":
                fig = px.bar(df, x=x_col, y=y_col, template="plotly_dark")
            else:
                return None

            return json.dumps(fig.to_dict(), cls=CustomEncoder)
        except Exception as e:
            logger.error(f"Plot generation failed: {e}")
            return None

    @classmethod
    def process_chat(cls, user_query: str, model_type: str, user_role: str) -> Tuple[Dict[str, Any], pd.DataFrame]:
        """
        Returns a tuple: (response_dict, dataframe)
        """
        # 1. Intent Classification
        intent = llm_router.classify_intent(user_query, model_type=model_type)

        # RBAC Check
        if user_role == "employee" and intent == "REVENUE_FORECAST":
            return {
                "type": "error",
                "content": "Authorization Failed: Employees are restricted from accessing Revenue Forecasting data.",
                "intent": intent
            }, pd.DataFrame()

        df = pd.DataFrame()
        generated_sql = ""
        insight = {}

        # 2. Routing Logic
        if intent == "REVENUE_FORECAST":
            df, msg = forecasting_engine.predict_revenue_for_date(user_query)
            if df.empty:
                return {
                    "type": "error",
                    "content": f"Forecasting Failed: {msg}",
                    "intent": intent
                }, pd.DataFrame()

            insight = {
                "summary": msg,
                "visualization_type": "bar",
                "x_column": "date",
                "y_column": "predicted_revenue"
            }
        else:
            # SQL_QUERY
            generated_sql, raw_llm_response = llm_router.generate_sql(user_query, model_type=model_type)
            if generated_sql.startswith("-- SYSTEM ERROR"):
                 return {
                    "type": "error",
                    "content": generated_sql.replace("-- SYSTEM ERROR: ", ""),
                    "intent": intent
                }, pd.DataFrame()

            try:
                df = db_manager.run_select_query(generated_sql)
            except Exception as e:
                return {
                    "type": "error",
                    "content": f"SQL Execution Failed: {str(e)}",
                    "intent": intent
                }, pd.DataFrame()

            # Analyze
            insight = llm_router.analyze_data(df, user_query, model_type=model_type)

        # Generate Plotly JSON
        plot_output_json = cls.generate_plotly_json(df, insight)

        return {
            "type": "data",
            "content": insight.get("summary", "Data retrieved successfully."),
            "intent": intent,
            "sql": generated_sql,
            "insight": insight,
            "plot_json": plot_output_json
        }, df

