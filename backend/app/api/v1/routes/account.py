"""Hesap ayarları: şifre değiştirme ve hesabı silme."""

from collections.abc import Iterator
from contextlib import contextmanager

from fastapi import APIRouter, Request, status

from app.api.deps import AuthServiceDep, CurrentUser
from app.core.exceptions import WrongPasswordError
from app.core.rate_limit import LoginAttemptLimiter, LoginLimiterDep, attempt_key, client_ip
from app.models.user import User
from app.schemas.account import AccountDeleteRequest, PasswordChangeRequest
from app.schemas.error import ErrorResponse
from app.schemas.user import TokenResponse

router = APIRouter(prefix="/account")

_ERRORS = {
    401: {"model": ErrorResponse, "description": "Giriş gerekli"},
    422: {"model": ErrorResponse, "description": "Mevcut şifre hatalı veya bilgiler geçersiz"},
    429: {"model": ErrorResponse, "description": "Çok fazla hatalı şifre denemesi"},
}


@contextmanager
def _count_wrong_password(
    request: Request, user: User, limiter: LoginAttemptLimiter
) -> Iterator[None]:
    """Yanlış şifre denemelerini sayar; sınır aşıldıysa işlem hiç yapılmaz (429).

    Girişle AYNI sayaç kullanılır: çalınmış bir token'la buradan şifre tahmin edilemesin.
    """
    key = attempt_key(user.username, client_ip(request))
    limiter.check(key)
    try:
        yield
    except WrongPasswordError:
        limiter.record_failure(key)
        raise


@router.post(
    "/password",
    response_model=TokenResponse,
    summary="Şifreyi değiştir (diğer oturumlar kapanır, yeni token döner)",
    responses=_ERRORS,
)
def change_password(
    request: Request,
    data: PasswordChangeRequest,
    user: CurrentUser,
    auth: AuthServiceDep,
    limiter: LoginLimiterDep,
) -> TokenResponse:
    with _count_wrong_password(request, user, limiter):
        token = auth.change_password(user, data.current_password, data.new_password)
    return TokenResponse(access_token=token)


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hesabı ve tüm haritaları kalıcı olarak sil",
    responses=_ERRORS,
)
def delete_account(
    request: Request,
    data: AccountDeleteRequest,
    user: CurrentUser,
    auth: AuthServiceDep,
    limiter: LoginLimiterDep,
) -> None:
    with _count_wrong_password(request, user, limiter):
        auth.delete_account(user, data.password)