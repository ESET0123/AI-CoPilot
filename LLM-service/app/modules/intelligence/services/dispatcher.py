from app.core.constants import Intent
from app.modules.intelligence.services.handlers import HANDLERS
from app.core.logger import log_with_prefix

class Dispatcher:
    """Routes requests to appropriate handlers based on classified intent"""

    @staticmethod
    async def route(intent: Intent, query: str, role: str = None) -> str:
        log_with_prefix("Dispatcher", f"Routing to {intent.value} handler... (Role: {role})")

        handler = HANDLERS.get(intent)

        if not handler:
            log_with_prefix("Dispatcher", f"ERROR: No handler found for {intent}")
            return "Error: No handler configured for this intent"

        # Execute handler and get response
        response = await handler(intent, query, role)
        
        log_with_prefix("Dispatcher", f"Handler complete - {len(response)} chars")
        
        return response
