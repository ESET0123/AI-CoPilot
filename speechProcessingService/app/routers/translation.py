from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.modules.engines.whisper.translation_engine import translation_engine
from app.core.logger import log_with_prefix

router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    from_lang: str
    to_lang: str = "en"

class TranslationResponse(BaseModel):
    translated_text: str

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    try:
        log_with_prefix("TranslationRouter", f"Translating: {request.from_lang} -> {request.to_lang}")
        result = await translation_engine.translate(request.text, request.from_lang, request.to_lang)
        return TranslationResponse(translated_text=result)
    except Exception as e:
        log_with_prefix("TranslationRouter", f"❌ Translation failed: {e}", level="error")
        raise HTTPException(status_code=500, detail=str(e))
