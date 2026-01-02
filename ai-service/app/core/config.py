import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "GridOps Backend API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # Auth
    # In a real scenario, these would be in a DB. 
    # For now, we move them here to at least centralize config.
    ADMIN_USER: str = os.getenv("ADMIN_USER", "admin01")
    ADMIN_PASS: str = os.getenv("ADMIN_PASS", "adminpass")
    EMP_USER: str = os.getenv("EMP_USER", "emp01")
    EMP_PASS: str = os.getenv("EMP_PASS", "emppass")

    # API
    API_V1_STR: str = "/api"

settings = Settings()
