from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.routers import auth, chat, audio, system

def create_app() -> FastAPI:
    logger.info("Initializing AI Service...")
    
    app = FastAPI(title=settings.PROJECT_NAME)

    # CORS
    if settings.ENVIRONMENT == "production":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
            allow_headers=["Content-Type", "Authorization"],
        )
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Routers
    app.include_router(system.router)
    app.include_router(auth.router)
    app.include_router(audio.router)
    app.include_router(chat.router)

    return app

app = create_app()
