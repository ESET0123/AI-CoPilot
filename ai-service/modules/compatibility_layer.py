"""
Compatibility Layer for ai-service-2 Integration

This module converts ai-services-3 responses to the format expected by ai-service-2 clients.
Maintains separation of concerns by isolating format conversion logic.
"""

import json
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from datetime import datetime


class LegacyResponseFormatter:
    """
    Handles conversion of ai-services-3 responses to ai-service-2 compatible format.
    
    ai-service-2 format:
    {
        "content": JSON string containing {
            "text": str,
            "type": "text" | "chart" | "table" | "sql" | "error",
            "data": list of dicts (optional),
            "extras": dict (optional)
        }
    }
    """
    
    @staticmethod
    def convert_to_legacy_format(
        content: str,
        intent: str,
        data: Optional[List[Dict[str, Any]]] = None,
        sql: Optional[str] = None,
        insight: Optional[Dict[str, Any]] = None,
        plot_json: Optional[str] = None,
        response_type: str = "data"
    ) -> Dict[str, str]:
        """
        Converts ai-services-3 response to ai-service-2 format.
        
        Args:
            content: The main text content/summary
            intent: The detected intent (SQL_QUERY, REVENUE_FORECAST, etc.)
            data: DataFrame rows as list of dicts
            sql: Generated SQL query
            insight: Analysis insight dict
            plot_json: Plotly JSON string
            response_type: Response type from ai-services-3
            
        Returns:
            Dict with single "content" key containing JSON string
        """
        # Determine the response type
        if response_type == "error":
            response_payload = {
                "text": content,
                "type": "error",
                "data": None,
                "extras": {}
            }
        elif sql:
            # SQL query response
            response_payload = {
                "text": content if content else f"Executed SQL: {sql}",
                "type": "sql",
                "data": data if data else [],
                "extras": {"sql": sql}
            }
        elif intent == "REVENUE_FORECAST" and data:
            # Revenue forecast with chart
            response_payload = {
                "text": content,
                "type": "chart",
                "data": data,
                "extras": {
                    "chartType": "line",
                    "xKey": "date",
                    "yKey": "predicted_revenue",
                    "yLabel": "Revenue ($)"
                }
            }
        elif insight and insight.get("visualization_type") in ["line", "bar"]:
            # Chart visualization
            x_col = insight.get("x_column", "ts")
            y_col = insight.get("y_column", "value")
            chart_type = insight.get("visualization_type", "line")
            
            response_payload = {
                "text": content,
                "type": "chart",
                "data": data if data else [],
                "extras": {
                    "chartType": chart_type,
                    "xKey": x_col,
                    "yKey": y_col,
                    "yLabel": y_col.replace("_", " ").title()
                }
            }
        elif data and len(data) > 0:
            # Table data
            response_payload = {
                "text": content,
                "type": "table",
                "data": data,
                "extras": {}
            }
        else:
            # Plain text response
            response_payload = {
                "text": content,
                "type": "text",
                "data": None,
                "extras": {}
            }
        
        # Convert to JSON string (ai-service-2 expects content as JSON string)
        return {
            "content": json.dumps(response_payload, cls=NumpyEncoder)
        }


class NumpyEncoder(json.JSONEncoder):
    """
    Custom JSON encoder to handle NumPy and Pandas types.
    """
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        if pd.isna(obj):
            return None
        return super().default(obj)


def sanitize_dataframe_for_json(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Converts DataFrame to list of dicts with proper JSON serialization.
    
    Args:
        df: Pandas DataFrame
        
    Returns:
        List of dictionaries with JSON-safe values
    """
    if df.empty:
        return []
    
    # Replace inf and NaN values
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    
    # Convert to records
    return df.to_dict('records')
