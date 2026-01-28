from app.core.constants import Intent
from app.core.logger import log_with_prefix
import httpx
from app.core.config import settings

class BaseIntentHandler:
    """Base class for intent handlers to reduce redundancy"""
    
    @staticmethod
    async def call_service(
        service_name: str, 
        url: str, 
        query: str, 
        role: str, 
        allowed_roles: list,
        intent_label: str,
        response_key: str = "human_answer"
    ) -> str:
        if role != "ROLE_ADMINISTRATOR" and role not in allowed_roles:
            return f"Access Denied: You do not have permission to access {intent_label} services."

        log_with_prefix(f"{service_name} Handler", "Executing handler")
        log_with_prefix(f"{service_name} Handler", f"Sending query to {service_name.lower()} service: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json={"prompt": query})
                response.raise_for_status()
                data = response.json()
                
                if data.get("success"):
                    answer = data.get(response_key, "No response received.")
                    log_with_prefix(f"{service_name} Handler", f"Query successful, answer length: {len(answer)}")
                    return f"Intent: {intent_label}\n\n{answer}"
                else:
                    error = data.get(response_key, data.get("error", "Unknown error"))
                    log_with_prefix(f"{service_name} Handler", f"Query failed: {error}")
                    return f"{intent_label} Error: {error}"
                    
        except httpx.RequestError as e:
            log_with_prefix(f"{service_name} Handler", f"Request error: {str(e)}")
            return f"{service_name} Service unavailable: {str(e)}"
        except Exception as e:
            log_with_prefix(f"{service_name} Handler", f"Unexpected error: {str(e)}")
            return f"Unexpected error in {service_name.lower()}: {str(e)}"

class LoadForecastingHandler:
    """Handles load forecasting requests"""

    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        return await BaseIntentHandler.call_service(
            service_name="Load Forecasting",
            url=settings.LOAD_FORECASTING_API,
            query=query,
            role=role,
            allowed_roles=["ROLE_FIELD_OFFICER"],
            intent_label="Load Forecasting",
            response_key="answer"
        )

class TheftDetectionHandler:
    """Handles theft detection requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        return await BaseIntentHandler.call_service(
            service_name="Theft Detection",
            url=settings.THEFT_DETECTION_API,
            query=query,
            role=role,
            allowed_roles=["ROLE_FIELD_OFFICER", "ROLE_SUPERVISOR"],
            intent_label="Theft Detection"
        )
        
class AssetMonitoringHandler:
    """Handles asset monitoring requests"""
    
    @staticmethod
    async def handle(intent: Intent, query: str, role: str = None) -> str:
        return await BaseIntentHandler.call_service(
            service_name="Asset Monitoring",
            url=settings.ASSET_MONITORING_API,
            query=query,
            role=role,
            allowed_roles=["ROLE_FIELD_OFFICER"],
            intent_label="Asset Monitoring"
        )


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
