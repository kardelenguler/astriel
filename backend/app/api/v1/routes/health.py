"""Sağlık kontrolü: sunucu ve veritabanı çalışıyor mu?"""

import logging

from fastapi import APIRouter, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import DbSession

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/health",
    summary="Sunucu ve veritabanı durumu",
    responses={503: {"description": "Veritabanına ulaşılamıyor"}},
)
def health_check(db: DbSession, response: Response) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.exception("Veritabanı sağlık kontrolü başarısız")
        # İzleme araçları sadece durum koduna bakar; 200 dönersek sunucuyu sağlıklı sanırlar
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "degraded", "database": "unavailable"}
    return {"status": "ok", "database": "ok"}