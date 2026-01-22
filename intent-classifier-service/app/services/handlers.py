from app.core.constants import Intent
from app.core.logger import log_with_prefix

class LoadForecastingHandler:
    """Handles load forecasting requests"""
    
    @staticmethod
    def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Load Forecasting Handler", "Executing handler")
        log_with_prefix("Load Forecasting Handler", "Generating mock forecast data...")
        
        response = (
            "LOAD FORECASTING ROUTE\n\n"
            "Predicted load for tomorrow: 1,280 MW\n"
            "Confidence: 91%\n"
            "Peak hours: 6 PM - 9 PM\n\n"
            "[This is a mock response from the Load Forecasting service]"
        )
        
        log_with_prefix("Load Forecasting Handler", "Response generated successfully")
        return response


class TheftDetectionHandler:
    """Handles theft detection requests"""
    
    @staticmethod
    def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Theft Detection Handler", "Executing handler")
        log_with_prefix("Theft Detection Handler", "Analyzing theft patterns...")
        
        response = (
            "THEFT DETECTION ROUTE\n\n"
            "Active Alerts: 3\n"
            "Risk Level: HIGH\n"
            "Affected Areas: Zone A, Zone C\n"
            "Suspicious Meters: 12\n\n"
            "[This is a mock response from the Theft Detection service]"
        )
        
        log_with_prefix("Theft Detection Handler", "Response generated successfully")
        return response


class OtherHandler:
    """Handles unrecognized requests"""
    
    @staticmethod
    def handle(intent: Intent, query: str) -> str:
        log_with_prefix("Other Handler", "Executing fallback handler")
        log_with_prefix("Other Handler", f"Query did not match any domain. Detected: {intent.value}")
        
        response = (
            f"OTHER ROUTE (Detected Intent: {intent.value})\n\n"
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
    Intent.OTHER: OtherHandler.handle,
}