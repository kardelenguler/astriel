"""Hesap ayarları: şifre değiştirme ve hesabı silme."""

from fastapi import APIRouter, status

from app.api.deps import AuthServiceDep, CurrentUser
from app.schemas.account import AccountDeleteRequest, PasswordChangeRequest
from app.schemas.error import ErrorResponse
from app.schemas.user import TokenResponse

router = APIRouter(prefix="/account")

_ERRORS = {
    401: {"model": ErrorResponse, "description": "Giriş gerekli"},
    422: {"model": ErrorResponse, "description": "Mevcut şifre hatalı veya bilgiler geçersiz"},
}


@router.post(
    "/password",
    response_model=TokenResponse,
    summary="Şifreyi değiştir (diğer oturumlar kapanır, yeni token döner)",
    responses=_ERRORS,
)
def change_password(
    data: PasswordChangeRequest, user: CurrentUser, auth: AuthServiceDep
) -> TokenResponse:
    token = auth.change_password(user, data.current_password, data.new_password)
    return TokenResponse(access_token=token)


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hesabı ve tüm haritaları kalıcı olarak sil",
    responses=_ERRORS,
)
def delete_account(data: AccountDeleteRequest, user: CurrentUser, auth: AuthServiceDep) -> None:
    auth.delete_account(user, data.password)
    