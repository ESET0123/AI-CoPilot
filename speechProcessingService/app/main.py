from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.routers import transcribe, tts, translation
from app.modules.engines.whisper.whisper_engine import whisper_engine
from app.modules.engines.tts.xtts_engine import xtts_engine
from app.core.logger import log_with_prefix, setup_logger

# Setup logging
setup_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - handles startup and shutdown"""
    # Startup
    log_with_prefix("Server", f"{settings.PROJECT_NAME} started successfully")
    log_with_prefix("Server", f"Environment: {settings.ENVIRONMENT}")
    
    # Pre-load Whisper
    try:
        whisper_engine.initialize()
        log_with_prefix("Server", "✅ Whisper Engine pre-loaded")
    except Exception as e:
        log_with_prefix("Server", f"⚠️ Whisper pre-loading failed: {e}")

    # Pre-load XTTS v2
    try:
        if xtts_engine.initialize():
            log_with_prefix("Server", "✅ XTTS v2 Engine pre-loaded")
        else:
            log_with_prefix("Server", "⚠️ XTTS v2 pre-loading failed")
    except Exception as e:
        log_with_prefix("Server", f"⚠️ XTTS v2 pre-loading unexpected error: {e}")
        
    yield
    log_with_prefix("Server", "Shutting down...")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(transcribe.router, prefix="/api", tags=["transcribe"])
    app.include_router(tts.router, prefix="/api", tags=["tts"])
    app.include_router(translation.router, prefix="/api/translation", tags=["translation"])
    
    return app

app = create_app()
