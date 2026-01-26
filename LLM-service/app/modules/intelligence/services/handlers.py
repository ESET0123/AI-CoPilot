from app.core.constants import Intent
from app.core.logger import log_with_prefix
import httpx
from app.core.config import settings

class LoadForecastingHandler:
    """Handles load forecasting requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Load Forecasting Handler", "Executing handler")
        log_with_prefix("Load Forecasting Handler", "Generating mock forecast data...")
        
        response = (
            "LOAD FORECASTING ROUTE\n\n"
            "[This is a mock response from the Load Forecasting service]"
        )
        
        log_with_prefix("Load Forecasting Handler", "Response generated successfully")
        return response


class TheftDetectionHandler:
    """Handles theft detection requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Theft Detection Handler", "Executing handler")
        log_with_prefix("Theft Detection Handler", f"Sending query to theft detection service: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8010/api/v1/theft-detection/query",
                    json={"prompt": query}
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("success"):
                    sql = data.get("sql", "N/A")
                    result = data.get("result", [])
                    log_with_prefix("Theft Detection Handler", f"Query successful, result length: {len(str(result))}")
                    
                    # Format the response
                    response_text = "THEFT DETECTION ANALYSIS\n\n"
                    response_text += f"Generated SQL: {sql}\n\n"
                    if result:
                        response_text += f"Results:\n{result}\n"
                    else:
                        response_text += "No results found.\n"
                    
                    return response_text
                else:
                    error = data.get("error", "Unknown error")
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
    async def handle(intent: Intent, query: str) -> str:
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
                    
                    return f"ASSET MONITORING ANALYSIS\n\n{human_answer}"
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
    async def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Other Handler", "Executing fallback handler")
        log_with_prefix("Other Handler", f"Query did not match any domain. Detected: {intent.value}")
        
        response = (
            "OTHER ROUTE\n\n"
            "I can help you with:\n"
            "• Load Forecasting - Ask about power demand predictions\n"
            "• Theft Detection - Ask about suspicious activity or alerts\n\n"
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