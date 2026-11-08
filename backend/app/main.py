"""Astriel API giriş noktası.

Çalıştırmak için (backend/ klasöründe):
    uvicorn app.main:app --reload
"""

import logging
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
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

# Her yanıta eklenen güvenlik başlıkları (tarayıcıya "şunlara izin verme" der)
SECURITY_HEADERS = {
    # Tarayıcı dosya türünü tahmin etmesin (ör. bir .txt'yi script gibi çalıştırmasın)
    "X-Content-Type-Options": "nosniff",
    # Site başka sitelerin içine (iframe) gömülemesin: tıklama tuzaklarına karşı
    "X-Frame-Options": "DENY",
    # Başka siteye giden bağlantılarda sadece alan adı gönderilsin, sayfa adresi değil
    # (ör. /harita/<id> gibi adresler dışarı sızmasın)
    "Referrer-Policy": "strict-origin-when-cross-origin",
    # Site kamera, mikrofon ve konum gibi izinleri hiç kullanmaz; isteyemesin de
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    # Tarayıcı siteye 1 yıl boyunca sadece HTTPS ile bağlansın
    # (HTTP üzerinden, ör. localhost'ta, tarayıcılar bu başlığı yok sayar)
    "Strict-Transport-Security": "max-age=31536000",
}


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

        try:
            requested = (dist / path).resolve()
            # Güvenlik: "../.env" gibi istekler site klasörünün dışına çıkamaz
            if path and requested.is_relative_to(dist) and requested.is_file():
                return FileResponse(requested)
        except (ValueError, OSError):
            # Adreste null byte (%00) veya işletim sisteminin kabul etmediği bir yol varsa
            # resolve()/is_file() hata fırlatır. 500 yerine site açılır; Angular kendi
            # "Sayfa bulunamadı" ekranını gösterir.
            logger.warning("Geçersiz dosya yolu istendi: %r", path)
        return FileResponse(index)


async def add_security_headers(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    response = await call_next(request)
    for name, value in SECURITY_HEADERS.items():
        # Bir endpoint aynı başlığı kendisi koyduysa ona dokunma
        response.headers.setdefault(name, value)
    return response


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

    # Güvenlik başlıkları: en son eklendiği için en dışta çalışır ve
    # site dosyaları dahil (index.html, main.js...) her yanıta eklenir
    app.middleware("http")(add_security_headers)

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