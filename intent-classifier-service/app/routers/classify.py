# from fastapi import APIRouter
# from pydantic import BaseModel
# from app.services.intent_classifier import IntentClassifier
# from app.services.dispatcher import Dispatcher
# import logging

# logger = logging.getLogger("INTENT_SERVICE")

# router = APIRouter()

# class ClassifyRequest(BaseModel):
#     query: str

# @router.post("/api/classify")
# async def classify_intent_only(payload: ClassifyRequest):
#     logger.info(f"Received classify-only request for query: '{payload.query}'")
#     intent = await IntentClassifier.classify(payload.query)
#     logger.info(f"Result for classify-only: {intent}")
#     return {"intent": intent}

# @router.post("/api/process")
# async def process_request(payload: ClassifyRequest):
#     logger.info(f"START: Processing request for query: '{payload.query}'")
    
#     # 1. Classify
#     logger.debug("Step 1: Classifying intent...")
#     intent = await IntentClassifier.classify(payload.query)
#     logger.info(f"Step 1 COMPLETE: Classified as '{intent}'")
    
#     # 2. Dispatch
#     logger.debug(f"Step 2: Dispatching to handler for '{intent}'...")
#     response = await Dispatcher.route(intent, payload.query)
#     logger.info(f"Step 2 COMPLETE: Response received from downstream service.")
    
#     # 3. Return full context
#     logger.info("END: Request processed successfully. Returning response.")
#     return {
#         "query": payload.query,
#         "intent": intent,
#         "fulfillment": response
#     }
