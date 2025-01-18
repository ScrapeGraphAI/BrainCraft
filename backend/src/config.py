from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MISTRAL_API_KEY: str
    MISTRAL_MODEL: str = "mistral-medium"
    OPENAI_API_KEY: str
    LMNT_API_KEY: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings() 