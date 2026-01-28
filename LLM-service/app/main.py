from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.routers import process
# Removed transcribe and tts routers - now handled by speechProcessingService
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
    
    # Speech processing is now decoupled: models are loaded in speechProcessingService
    log_with_prefix("Server", "System ready: Intent Classifier active (Speech services decoupled to port 8003)")        
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
    # transcribe and tts routers moved to speechProcessingService
    
    return app

app = create_app()
