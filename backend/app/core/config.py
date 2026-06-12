"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/inventory"
    
    # App
    APP_NAME: str = "Inventory API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def cors_origins(self):
        """Return the single configured allowed CORS origin."""
        return [self.FRONTEND_URL.strip()] if self.FRONTEND_URL.strip() else []
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
