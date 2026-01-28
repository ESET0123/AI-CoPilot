from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="llama3.2", env="OLLAMA_MODEL")
    OLLAMA_TIMEOUT: int = Field(default=300, env="OLLAMA_TIMEOUT")
    DB_PATH: str = Field(default="utility.db", env="DB_PATH")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
