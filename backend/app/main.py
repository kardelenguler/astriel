"""Astriel API giriş noktası.

Çalıştırmak için (backend/ klasöründe):
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.exception_handlers import register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging_config import setup_logging


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Swiss Ephemeris tabanlı doğum haritası API'si",
    )

    # SIRA ÖNEMLİ: son eklenen middleware en dışta çalışır.
    # Önce hata yakalama, sonra CORS eklenir; böylece CORS hata yanıtlarını da sarar
    # ve 500 yanıtlarında da CORS başlığı bulunur.
    register_exception_handlers(app)

    # Angular (localhost:4200) farklı bir adreste çalıştığı için tarayıcı izin ister
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    return app


app = create_app() 