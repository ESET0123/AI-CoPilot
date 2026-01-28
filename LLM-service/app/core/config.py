import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Intent Classifier Service"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5173,http://localhost:3000"
    ).split(",")
    
    API_V1_STR: str = "/api"
    
    # LLM Configuration
    OLLAMA_API: str = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    OLLAMA_TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "1000"))
    
    # Domain Service URLs
    LOAD_FORECASTING_API: str = os.getenv(
        "LOAD_FORECASTING_API", 
        "http://127.0.0.1:8012/api/v1/forecast/query"
    )
    THEFT_DETECTION_API: str = os.getenv(
        "THEFT_DETECTION_API", 
        "http://127.0.0.1:8013/api/v1/theft-detection/query"
    )
    ASSET_MONITORING_API: str = os.getenv(
        "ASSET_MONITORING_API", 
        "http://127.0.0.1:8011/api/v1/asset-monitoring/query"
    )

settings = Settings()
