from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    PORT: int = 8010
    HOST: str = "0.0.0.0"
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="gemma3:12b", env="OLLAMA_MODEL")
    DB_PATH: str = Field(default="utility.db", env="DB_PATH")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
