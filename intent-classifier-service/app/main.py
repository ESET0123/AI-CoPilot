from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.routers import process, transcribe, tts
from app.modules.speech.engines.whisper.whisper_engine import whisper_engine
from app.core.logger import log_with_prefix, setup_logger

# Setup logging
setup_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - handles startup and shutdown"""
    # Startup
    log_with_prefix("Server", f"{settings.PROJECT_NAME} started successfully")
    log_with_prefix("Server", f"Environment: {settings.ENVIRONMENT}")
    log_with_prefix("Server", f"Ollama Model: {settings.OLLAMA_MODEL}")
    
    # Pre-load Whisper model for zero-lag first request
    try:
        whisper_engine.initialize()
        log_with_prefix("Server", "✅ Whisper Engine pre-loaded")
    except Exception as e:
        log_with_prefix("Server", f"⚠️ Whisper pre-loading failed: {e}")
        
    log_with_prefix("Server", f"API endpoint: /api/process")
    
    yield
    
    # Shutdown (if cleanup needed in future)
    log_with_prefix("Server", "Shutting down...")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Intent classification and routing service for energy grid queries",
        lifespan=lifespan
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(process.router, prefix="/api", tags=["process"])
    app.include_router(transcribe.router, prefix="/api", tags=["transcribe"])
    app.include_router(tts.router, prefix="/api", tags=["tts"])
    
    return app

app = create_app()