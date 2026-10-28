from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Base de datos ---
    # Puerto 6543 = transaction pooler (runtime). Puerto 5432 = directo (Alembic).
    database_url: str = Field(
        description="postgresql+asyncpg://...@...pooler.supabase.com:6543/postgres"
    )
    db_echo: bool = False

    # --- Supabase ---
    supabase_url: str
    supabase_jwt_secret: str = Field(
        description="Legacy JWT secret del proyecto, para verificar los tokens HS256"
    )
    supabase_service_key: str = Field(default="", description="Solo para Storage")
    storage_bucket: str = "session-files"

    # --- Proveedores externos ---
    openai_api_key: str = ""       # Whisper
    openrouter_api_key: str = ""   # LLM
    llm_model: str = "anthropic/claude-sonnet-5"

    # --- Google Calendar (SPEC-CAL-01). Vacio = la agenda funciona sin sincronizar ---
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/integrations/google/callback"
    # Clave Fernet (urlsafe base64 de 32 bytes) para cifrar el refresh token en reposo y
    # firmar el `state` de OAuth. Obligatoria para habilitar Google; sin ella se desactiva.
    google_token_key: str = ""
    calendar_timezone: str = "America/Lima"
    frontend_url: str = "http://localhost:5173"

    # --- App ---
    cors_origins: list[str] = ["http://localhost:5173"]
    api_prefix: str = "/api/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
