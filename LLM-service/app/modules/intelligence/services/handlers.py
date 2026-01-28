from app.core.constants import Intent
from app.core.logger import log_with_prefix
import httpx
from app.core.config import settings

class LoadForecastingHandler:
    """Handles load forecasting requests"""

    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        if role != "ROLE_ADMINISTRATOR" and role != "ROLE_FIELD_OFFICER":
            return f"Access Denied: You do not have permission to access {intent.value} services."
        
        log_with_prefix("Load Forecasting Handler", "Executing handler")
        log_with_prefix("Load Forecasting Handler", f"Sending query to load forecasting service: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8012/api/v1/forecast/query",
                    json={"prompt": query}
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("success"):
                    answer = data.get("answer", "No response received.")
                    log_with_prefix("Load Forecasting Handler", f"Query successful, answer length: {len(answer)}")
                    
                    return f"Intent: Load Forecasting\n\n{answer}"
                else:
                    error = data.get("answer", data.get("error", "Unknown error"))
                    log_with_prefix("Load Forecasting Handler", f"Query failed: {error}")
                    return f"Load Forecasting Error: {error}"
                    
        except httpx.RequestError as e:
            log_with_prefix("Load Forecasting Handler", f"Request error: {str(e)}")
            return f"Load Forecasting Service unavailable: {str(e)}"
        except Exception as e:
            log_with_prefix("Load Forecasting Handler", f"Unexpected error: {str(e)}")
            return f"Unexpected error in load forecasting: {str(e)}"



class TheftDetectionHandler:
    """Handles theft detection requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        if role not in ["ROLE_ADMINISTRATOR", "ROLE_FIELD_OFFICER", "ROLE_SUPERVISOR"]:
            return f"Access Denied: You do not have permission to access {intent.value} services."

        log_with_prefix("Theft Detection Handler", "Executing handler")
        log_with_prefix("Theft Detection Handler", f"Sending query to theft detection service: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8013/api/v1/theft-detection/query",
                    json={"prompt": query}
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("success"):
                    human_answer = data.get("human_answer", "No response received.")
                    log_with_prefix("Theft Detection Handler", f"Query successful, answer length: {len(human_answer)}")
                    
                    return f"Intent: Theft Detection\n\n{human_answer}"
                else:
                    error = data.get("human_answer", data.get("error", "Unknown error"))
                    log_with_prefix("Theft Detection Handler", f"Query failed: {error}")
                    return f"Theft Detection Error: {error}"
                    
        except httpx.RequestError as e:
            log_with_prefix("Theft Detection Handler", f"Request error: {str(e)}")
            return f"Theft Detection Service unavailable: {str(e)}"
        except Exception as e:
            log_with_prefix("Theft Detection Handler", f"Unexpected error: {str(e)}")
            return f"Unexpected error in theft detection: {str(e)}"
        
class AssetMonitoringHandler:
    """Handles asset monitoring requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        if role != "ROLE_ADMINISTRATOR" and role != "ROLE_FIELD_OFFICER":
            return f"Access Denied: You do not have permission to access {intent.value} services."

        log_with_prefix("Asset Monitoring Handler", "Executing handler")
        log_with_prefix("Asset Monitoring Handler", f"Sending query to asset monitoring service: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8011/api/v1/asset-monitoring/query",
                    json={"prompt": query}
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("success"):
                    human_answer = data.get("human_answer", "No response received.")
                    log_with_prefix("Asset Monitoring Handler", f"Query successful, answer length: {len(human_answer)}")
                    
                    return f"Intent: Asset Monitoring\n\n{human_answer}"
                else:
                    error = data.get("human_answer", data.get("error", "Unknown error"))
                    log_with_prefix("Asset Monitoring Handler", f"Query failed: {error}")
                    return f"Asset Monitoring Error: {error}"
                    
        except httpx.RequestError as e:
            log_with_prefix("Asset Monitoring Handler", f"Request error details: {type(e).__name__}: {str(e)}", level="error")
            return f"Asset Monitoring Service unavailable: {type(e).__name__}"
        except Exception as e:
            log_with_prefix("Asset Monitoring Handler", f"Unexpected error: {str(e)}")
            return f"Unexpected error in asset monitoring: {str(e)}"


class OtherHandler:
    """Handles unrecognized requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        log_with_prefix("Other Handler", "Executing fallback handler")
        log_with_prefix("Other Handler", f"Query did not match any domain. Detected: {intent.value}")
        
        response = (
            "Intent: Others\n\n"
            "I can help you with:\n"
            "• Load Forecasting - Ask about power demand predictions\n"
            "• Theft Detection - Ask about suspicious activity or alerts\n\n"
            "• Asset Monitoring - Ask about asset status or alerts\n\n"
            "Your query didn't match these categories.\n\n"
            "[This is a mock response from the fallback handler]"
        )
        
        return response


# Handler registry
HANDLERS = {
    Intent.LOAD_FORECASTING: LoadForecastingHandler.handle,
    Intent.THEFT_DETECTION: TheftDetectionHandler.handle,
    Intent.ASSET_MONITORING: AssetMonitoringHandler.handle,
    Intent.OTHER: OtherHandler.handle,
}
