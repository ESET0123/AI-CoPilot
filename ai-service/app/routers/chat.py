from fastapi import APIRouter, HTTPException, Body
from app.models.api import ChatRequest, ChatResponse, DataFrameData, LegacyChatRequest, LegacyChatResponse
from app.services.chat import ChatService
from modules.compatibility_layer import LegacyResponseFormatter, sanitize_dataframe_for_json
import threading
import json
import logging
import numpy as np

# This import is key for legacy support - we need to handle cancellations
# For now, we'll implement a simple cancellation store here or in the service
# Since cancellation was global in main, we can keep a simple store here.

router = APIRouter()
logger = logging.getLogger("AI_SERVICE")

cancellation_tokens: dict[str, threading.Event] = {}

def get_cancel_event(convo_id: str) -> threading.Event:
    if not convo_id:
        return threading.Event()
    if convo_id not in cancellation_tokens:
        cancellation_tokens[convo_id] = threading.Event()
    return cancellation_tokens[convo_id]

@router.post("/api/chat", response_model=ChatResponse)
async def chat_handler(request: ChatRequest):
    try:
        response_data, df = ChatService.process_chat(
            request.message, 
            request.model_type, 
            request.user_role
        )

        data_rows = []
        if not df.empty:
            # Handle NaN/Inf
            df_safe = df.replace([np.inf, -np.inf], np.nan).fillna(0)
            data_rows = df_safe.to_dict('records')

        return ChatResponse(
            role="assistant", # Default from model
            type=response_data.get("type", "data"),
            content=response_data.get("content", ""),
            intent=response_data.get("intent", ""),
            data=DataFrameData(rows=data_rows),
            sql=response_data.get("sql"),
            insight=response_data.get("insight"),
            plot_json=response_data.get("plot_json")
        )

    except Exception as e:
        logger.error(f"Chat Handler Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# --- LEGACY SUPPORT ---

@router.post("/chat", response_model=LegacyChatResponse)
async def legacy_chat_endpoint(request: LegacyChatRequest):
    convo_id = request.conversation_id
    if convo_id in cancellation_tokens:
        cancellation_tokens[convo_id].clear()
    
    cancel_event = get_cancel_event(convo_id)
    
    # We can't easily pass cancellation down to sync modules without refactoring them too,
    # but we can check it before/after steps.
    # For this refactor, we will rely on ChatService but wrap it slightly or just accept
    # that we aren't fully replicating the granular cancellation inside the monolithic function 
    # unless we move that logic into Service entirely.
    # The ChatService.process_chat is currently atomic.
    
    if cancel_event.is_set():
         return LegacyChatResponse(content=json.dumps({"text": "Cancelled", "type": "error"}))

    try:
        # Default legacy params
        response_data, df = ChatService.process_chat(request.message, "local", "admin")

        if cancel_event.is_set():
             return LegacyChatResponse(content=json.dumps({"text": "Cancelled", "type": "error"}))
        
        # Format for legacy
        # We need to map the structured ChatResponse back to the string blob
        
        data_rows = sanitize_dataframe_for_json(df)
        
        legacy_formatted = LegacyResponseFormatter.convert_to_legacy_format(
            content=response_data.get("content", ""),
            intent=response_data.get("intent", ""),
            data=data_rows,
            insight=response_data.get("insight"),
            sql=response_data.get("sql"),
            response_type=response_data.get("type", "data")
        )

        return LegacyChatResponse(**legacy_formatted)

    except Exception as e:
        return LegacyChatResponse(content=json.dumps({"text": str(e), "type": "error"}))

@router.post("/stop")
def stop_generation(payload: dict = Body(...)):
    convo_id = payload.get("conversation_id")
    if convo_id and convo_id in cancellation_tokens:
        cancellation_tokens[convo_id].set()
    return {"message": "Stop signal received"}
