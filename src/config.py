from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pydantic import SecretStr
from typing import Optional
from urllib.parse import urlparse, urlunparse

current_directory = os.path.dirname(os.path.abspath(__file__))
env_file_path = os.path.join(current_directory, "..", ".env")


class Settings(BaseSettings):
    app_name: str = "FastAPI Fintech Web App"
    description: str = "A portfolio fintech app for virtual trading, portfolios, and social market feeds."
    model_config = SettingsConfigDict(env_file=env_file_path, extra="ignore")

    database_url: Optional[SecretStr] = None
    db_host: Optional[str] = None
    db_port: int = 5432
    db_user: Optional[str] = None
    db_pass: Optional[SecretStr] = None
    db_name: Optional[str] = None
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        if self.database_url:
            return self._to_asyncpg_url(self.database_url.get_secret_value())

        missing = [
            key
            for key, value in {
                "DB_HOST": self.db_host,
                "DB_USER": self.db_user,
                "DB_PASS": self.db_pass,
                "DB_NAME": self.db_name,
            }.items()
            if not value
        ]
        if missing:
            raise ValueError(f"Missing database configuration: {', '.join(missing)}")

        return (
            "postgresql+asyncpg://"
            f"{self.db_user}:{self.db_pass.get_secret_value()}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @staticmethod
    def _to_asyncpg_url(database_url: str) -> str:
        parsed = urlparse(database_url)
        if parsed.scheme == "postgresql+asyncpg":
            return database_url
        if parsed.scheme in {"postgres", "postgresql"}:
            return urlunparse(parsed._replace(scheme="postgresql+asyncpg"))
        return database_url


settings = Settings()  # type: ignore
