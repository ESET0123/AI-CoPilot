from app.models.schemas import ProcessRequest, ProcessResponse
from app.modules.intelligence.services.intent_classifier import intent_classifier
from app.modules.intelligence.services.dispatcher import Dispatcher
from app.modules.speech_client import speech_client
from app.core.logger import log_with_prefix

class PipelineService:
    @staticmethod
    async def process_full_cycle(payload: ProcessRequest) -> ProcessResponse:
        """
        Orchestrates the complete 'Round-Trip' processing pipeline.
        Translation -> Intent Classification -> Routing -> Response Translation.
        """
        log_with_prefix("Pipeline", f"Processing: {payload.query[:50]}... (Lang: {payload.language})")
        
        processing_query = payload.query
        
        # Step 0: Input Translation (Convert to English for system logic)
        is_query_english = all(ord(c) < 128 for c in payload.query.replace('\n', ' ').strip()[:100])
        
        if payload.language and payload.language != "en":
            if is_query_english:
                log_with_prefix("Pipeline", "Step 0: Query appears to be English. Skipping translation to English.")
                processing_query = payload.query
            else:
                log_with_prefix("Pipeline", f"Step 0: Translating query to English...")
                try:
                    processing_query = await speech_client.translate(payload.query, payload.language, "en")
                    log_with_prefix("Pipeline", f"Working Context: {processing_query}")
                except Exception as e:
                    log_with_prefix("Pipeline", f"⚠️ Translation failed: {str(e)}. Using original query.", level="warning")
                    processing_query = payload.query

        # Step 1: Classify Intent
        intent = await intent_classifier.classify(processing_query)
        
        # Step 2: Route and Execute Handler
        response_text = await Dispatcher.route(intent, processing_query)
        
        # Step 3: Response Translation (Convert back to user's native language)
        translated_response = None
        final_response_text = response_text
        
        if payload.language and payload.language != "en":
            log_with_prefix("Pipeline", f"Step 3: Translating response back to {payload.language}...")
            try:
                translated_response = await speech_client.translate(response_text, "en", payload.language)
                final_response_text = translated_response # SWAP: Main response becomes the translated one
                log_with_prefix("Pipeline", "Translation complete")
            except Exception as e:
                log_with_prefix("Pipeline", f"⚠️ Response translation failed: {str(e)}. Client will receive English.", level="warning")
                translated_response = None

        return ProcessResponse(
            query=payload.query,
            intent=intent.value,
            response=final_response_text, # This is now in target language (if success)
            language=payload.language,
            translated_response=translated_response,
            english_response=response_text # Always keep original English here
        )
