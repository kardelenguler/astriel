"""Hesap ayarları isteklerinin şemaları."""

from pydantic import BaseModel, Field

from app.schemas.user import PASSWORD_MAX_LENGTH


class PasswordChangeRequest(BaseModel):
    # Şifreler bilerek "strip" edilmez: baştaki/sondaki boşluk şifrenin parçası olabilir
    current_password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)
    new_password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)


class AccountDeleteRequest(BaseModel):
    password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)