"""Hesap ayarları isteklerinin şemaları."""

from pydantic import BaseModel, Field


class PasswordChangeRequest(BaseModel):
    # Şifreler bilerek "strip" edilmez: baştaki/sondaki boşluk şifrenin parçası olabilir
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AccountDeleteRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)
