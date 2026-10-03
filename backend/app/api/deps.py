"""Route'ların ortak bağımlılıkları (FastAPI Depends).

Route fonksiyonlarında parametre olarak yazmak yeterlidir:

    def my_route(user: CurrentUser, service: ChartServiceDep): ...

FastAPI her istek için gerekeni üretir; oturum istek bitince kapatılır.
"""
from functools import lru_cache 
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.clients.geocoder import NominatimGeocoder 
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.chart_service import ChartService
from app.services.saved_chart_service import SavedChartService 

# ------------------------------ Veritabanı ------------------------------
DbSession = Annotated[Session, Depends(get_db)]


# ------------------------------ Servisler ------------------------------
def get_chart_service() -> ChartService:
    return ChartService()


ChartServiceDep = Annotated[ChartService, Depends(get_chart_service)]




def get_saved_chart_service(db: DbSession, calculator: ChartServiceDep) -> SavedChartService:
    return SavedChartService(db, calculator)


SavedChartServiceDep = Annotated[SavedChartService, Depends(get_saved_chart_service)] 


# ------------------------------ Dış servisler ------------------------------
@lru_cache(maxsize=1)
def get_geocoder() -> NominatimGeocoder:
    """Uygulama boyunca TEK bir geocoder.

    Hız sınırı ve önbellek HERKES için ortak olmalı. Her istekte yeni bir tane
    oluşturulsaydı her biri "ilk isteğim" sanır, saniyede 1 kuralı çiğnenir ve
    önbellek hiçbir işe yaramazdı.
    """
    return NominatimGeocoder()


GeocoderDep = Annotated[NominatimGeocoder, Depends(get_geocoder)] 

def get_auth_service(db: DbSession) -> AuthService:
    return AuthService(db)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


# --------------------------- Giriş yapmış kullanıcı ---------------------------
# İsteğin "Authorization: Bearer <token>" başlığından token'ı okur.
# tokenUrl: Swagger'daki Authorize düğmesi giriş için bu adrese istek atar.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], auth: AuthServiceDep
) -> User:
    return auth.get_current_user(token)


# Bir route'a bu parametreyi eklemek, o route'u "giriş zorunlu" yapar
CurrentUser = Annotated[User, Depends(get_current_user)] 