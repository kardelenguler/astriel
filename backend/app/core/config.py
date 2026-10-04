"""Uygulama ayarları.

Tüm ayarlar .env dosyasından (production'da sunucunun ortam değişkenlerinden)
okunur ve Pydantic ile doğrulanır. Projenin geri kalanı ayarlara SADECE
buradan erişir:

    from app.core.config import settings
"""

from pathlib import Path
from typing import Any, Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ klasörünün yolu (bu dosya: backend/app/core/config.py)
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",  # .env'de tanımadığımız bir satır varsa hata verme
    )

    # ---------- Uygulama ----------
    app_name: str = "Astriel"
    environment: Literal["development", "production", "test"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # ---------- Veritabanı ----------
    database_url: SecretStr  # varsayılan yok: .env'de yoksa uygulama başlamaz

    # ---------- Test ----------
    # Tanımlı değilse veritabanı gerektiren testler atlanır
    test_database_url: SecretStr | None = None

    # ---------- Güvenlik ----------
    secret_key: SecretStr
    access_token_expire_minutes: int = Field(default=60, gt=0)

    # ---------- Frontend ----------
    cors_origins: str = "http://localhost:4200"
    # Derlenmiş Angular dosyalarının klasörü (ng build çıktısı).
    # Tanımlıysa FastAPI siteyi de sunar (production'da tek adres: hem site hem API).
    frontend_dist: Path | None = None

    # ---------- Yer arama (Nominatim / OpenStreetMap) ----------
    geocoder_url: str = "https://nominatim.openstreetmap.org/search"
    # Nominatim kuralı: uygulamayı tanıtan bir User-Agent zorunlu, iletişim bilgisiyle.
    # Kütüphanenin varsayılan User-Agent'ı kabul edilmez; kurala uymayan IP engellenir.
    geocoder_user_agent: str = Field(min_length=10)
    geocoder_timeout_seconds: float = Field(default=5.0, gt=0)

    # ---------- Astroloji ----------
    ephe_path: Path = Path("ephemeris")

    # Neon/Render gibi servisler adresi "postgresql://..." verir;
    # bizim sürücümüz (psycopg 3) "postgresql+psycopg://..." bekler. Otomatik çevir.
    @field_validator("database_url", "test_database_url", mode="before")
    @classmethod
    def use_psycopg_driver(cls, value: Any) -> Any:
        if isinstance(value, str):
            for prefix in ("postgres://", "postgresql://"):
                if value.startswith(prefix):
                    return "postgresql+psycopg://" + value.removeprefix(prefix)
        return value

    @field_validator("secret_key")
    @classmethod
    def secret_key_must_be_strong(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 32:
            raise ValueError("SECRET_KEY en az 32 karakter olmalı.")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        """'a,b' biçimindeki metni ['a', 'b'] listesine çevirir."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def ephe_dir(self) -> Path:
        """Göreli yolu backend/ klasörüne göre mutlak yola çevirir."""
        if self.ephe_path.is_absolute():
            return self.ephe_path
        return BASE_DIR / self.ephe_path

    @property
    def frontend_dir(self) -> Path | None:
        """frontend_dist göreliyse backend/ klasörüne göre mutlak yola çevirir."""
        if self.frontend_dist is None:
            return None
        if self.frontend_dist.is_absolute():
            return self.frontend_dist
        return (BASE_DIR / self.frontend_dist).resolve()


settings = Settings()
