from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/api")

@router.get("/health")
def get_health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
