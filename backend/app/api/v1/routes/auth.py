"""Kayıt, giriş ve "ben kimim" endpoint'leri."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import AuthServiceDep, CurrentUser
from app.core.exceptions import AuthenticationError
from app.core.rate_limit import LoginLimiterDep, attempt_key, client_ip
from app.schemas.error import ErrorResponse
from app.schemas.user import TokenResponse, UserCreate, UserOut

router = APIRouter(prefix="/auth")

_UNAUTHORIZED = {401: {"model": ErrorResponse, "description": "Giriş gerekli veya bilgiler hatalı"}}


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni hesap oluştur",
    responses={409: {"model": ErrorResponse, "description": "Kullanıcı adı veya e-posta zaten kayıtlı"}},
)
def register(data: UserCreate, auth: AuthServiceDep) -> UserOut:
    return UserOut.model_validate(auth.register(data))


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Giriş yap ve token al",
    responses={
        **_UNAUTHORIZED,
        429: {"model": ErrorResponse, "description": "Çok fazla hatalı deneme"},
    },
)
def login(
    request: Request,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth: AuthServiceDep,
    limiter: LoginLimiterDep,
) -> TokenResponse:
    # OAuth2 standardı gereği JSON değil FORM verisi alır (username + password alanları).
    # Swagger'daki Authorize düğmesi de bu biçimde gönderir.
    key = attempt_key(form.username, client_ip(request))
    limiter.check(key)  # sınır aşıldıysa şifre hiç kontrol edilmez

    try:
        token = auth.login(form.username, form.password)
    except AuthenticationError:
        limiter.record_failure(key)
        raise

    limiter.reset(key)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Giriş yapmış kullanıcının bilgileri",
    responses=_UNAUTHORIZED,
)
def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
