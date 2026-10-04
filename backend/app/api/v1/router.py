"""API v1: tüm route'lar burada toplanır ve /api/v1 önekiyle yayınlanır."""

from fastapi import APIRouter

from app.api.v1.routes import account, auth, chart, health, places
from app.schemas.error import ErrorResponse

# Tüm endpoint'lerin dokümantasyonunda hata yanıtlarının gerçek biçimi görünsün
api_router = APIRouter(
    prefix="/api/v1",
    responses={
        422: {"model": ErrorResponse, "description": "Geçersiz giriş"},
        500: {"model": ErrorResponse, "description": "Sunucu hatası"},
    },
)

api_router.include_router(health.router, tags=["Sağlık"])
api_router.include_router(auth.router, tags=["Kimlik"])
api_router.include_router(account.router, tags=["Hesap"])
api_router.include_router(chart.router, tags=["Harita"])
api_router.include_router(places.router, tags=["Yer arama"])