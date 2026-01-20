from fastapi import APIRouter, HTTPException, Body
from app.models.api import ChatRequest, ChatResponse, DataFrameData
from app.services.chat import ChatService
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
    logger.info(f"Chat Request: {request.message[:100]}...")
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

        response = ChatResponse(
            role="assistant", # Default from model
            type=response_data.get("type", "data"),
            content=response_data.get("content", ""),
            intent=response_data.get("intent", ""),
            data=DataFrameData(rows=data_rows),
            sql=response_data.get("sql"),
            insight=response_data.get("insight"),
            plot_json=response_data.get("plot_json")
        )
        
        logger.info(f"Chat Response Content: {response.content[:100]}...")
        return response

    except Exception as e:
        logger.error(f"Chat Handler Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.post("/stop")
def stop_generation(payload: dict = Body(...)):
    convo_id = payload.get("conversation_id")
    if convo_id and convo_id in cancellation_tokens:
        cancellation_tokens[convo_id].set()
    return {"message": "Stop signal received"}

@router.post("/stop")
def stop_generation(payload: dict = Body(...)):
    convo_id = payload.get("conversation_id")
    if convo_id and convo_id in cancellation_tokens:
        cancellation_tokens[convo_id].set()
    return {"message": "Stop signal received"}
