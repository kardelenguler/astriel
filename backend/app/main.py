"""Astriel API giriş noktası.

Çalıştırmak için (backend/ klasöründe):
    uvicorn app.main:app --reload
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.exception_handlers import register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.db.session import SessionLocal
from app.services.saved_chart_service import purge_old_deleted_charts

logger = logging.getLogger(__name__)


def run_startup_maintenance() -> None:
    """Uygulama açılırken bakım işleri. Hata olsa bile uygulama yine de açılır."""
    try:
        with SessionLocal() as db:
            purge_old_deleted_charts(db)
    except SQLAlchemyError:
        logger.exception("Açılış bakımı başarısız (silinmiş haritalar temizlenemedi)")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Testlerde çalışmaz: testler kendi veritabanını kendisi yönetir
    if settings.environment != "test":
        run_startup_maintenance()
    yield


def mount_frontend(app: FastAPI, dist: Path) -> None:
    """Derlenmiş Angular sitesini sunar.

    - Var olan bir dosya istenirse (main.js, logo.png...) o dosya döner.
    - Diğer her adres (/harita, /haritalarim...) index.html döner;
      sayfayı Angular'ın kendi yönlendiricisi seçer.
    - API route'ları bundan ÖNCE eklendiği için önceliklidir.
    """
    dist = dist.resolve()
    index = dist / "index.html"

    @app.get("/{path:path}", include_in_schema=False)
    def serve_frontend(path: str) -> FileResponse:
        # Bilinmeyen API adresleri site yerine JSON 404 dönsün
        if path == "api" or path.startswith("api/"):
            raise StarletteHTTPException(status_code=404)

        requested = (dist / path).resolve()
        # Güvenlik: "../.env" gibi istekler site klasörünün dışına çıkamaz
        if path and requested.is_relative_to(dist) and requested.is_file():
            return FileResponse(requested)
        return FileResponse(index)


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Swiss Ephemeris tabanlı doğum haritası API'si",
        lifespan=lifespan,
    )

    # SIRA ÖNEMLİ: son eklenen middleware en dışta çalışır.
    # Önce hata yakalama, sonra CORS eklenir; böylece CORS hata yanıtlarını da sarar
    # ve 500 yanıtlarında da CORS başlığı bulunur.
    register_exception_handlers(app)

    # Geliştirmede Angular (localhost:4200) farklı bir adreste çalıştığı için
    # tarayıcı izin ister. Production'da site ve API aynı adreste olduğundan gerekmez.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    # Production: derlenmiş Angular sitesi varsa onu da sun (EN SONDA eklenmeli)
    dist = settings.frontend_dir
    if dist is not None:
        if (dist / "index.html").is_file():
            mount_frontend(app, dist)
            logger.info("Frontend sunuluyor: %s", dist)
        else:
            logger.warning("FRONTEND_DIST tanımlı ama index.html bulunamadı: %s", dist)

    return app


app = create_app()
