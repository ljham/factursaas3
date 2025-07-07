from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os

class Settings(BaseSettings):
    DB_APP_USER: str = Field(..., env="DB_APP_USER")
    DB_APP_PASSWORD: str = Field(..., env="DB_APP_PASSWORD")
    DB_APP_NAME: str = Field(..., env="DB_APP_NAME")
    POSTGRES_HOST: str = Field(default="localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(default=5432, env="POSTGRES_PORT")
    
    CLERK_SECRET_KEY: Optional[str] = Field(default=None, env="CLERK_SECRET_KEY")
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Optional[str] = Field(default=None, env="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_APP_USER}:{self.DB_APP_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.DB_APP_NAME}"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
print("🔍 ENV in container:", dict(os.environ))