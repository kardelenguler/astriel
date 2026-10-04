"""Kullanıcı ve giriş (auth) API'sinin istek ve yanıt modelleri (Pydantic)."""

import re
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# Sadece küçük İngilizce harf, rakam ve alt çizgi; 3–30 karakter.
# Türkçe karakterler (ç, ş, ı...) bilerek dışarıda: büyük/küçük harf dönüşümünde
# (I -> ı / i) karışıklık çıkarır ve iki farklı görünen ad aynı hesabı gösterebilir.
USERNAME_PATTERN = re.compile(r"[a-z0-9_]{3,30}")


# =============================== İSTEK ===============================
class UserCreate(BaseModel):
    """Kayıt formu. Sadece kullanıcı adı ve şifre zorunlu."""

    # NOT: str_strip_whitespace burada KULLANILMAZ; şifredeki boşluklar şifrenin parçasıdır.
    username: str = Field(examples=["kardelen"])
    password: str = Field(min_length=8, max_length=128, examples=["gizli-sifre-123"])
    email: EmailStr | None = Field(default=None, examples=["ornek@mail.com"])
    display_name: str | None = Field(default=None, max_length=100, examples=["Kardelen"])

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        # "  Kardelen " ile "kardelen" aynı hesap sayılsın
        value = value.strip().lower()
        if not USERNAME_PATTERN.fullmatch(value):
            raise ValueError(
                "Kullanıcı adı 3–30 karakter olmalı ve sadece İngilizce harf, "
                "rakam ve alt çizgi (_) içermeli."
            )
        return value

    @field_validator("email", "display_name", mode="before")
    @classmethod
    def blank_to_none(cls, value: Any) -> Any:
        # Formda boş bırakılan alan "" olarak gelir; bunu "girilmedi" (None) sayarız
        if isinstance(value, str) and not value.strip():
            return None
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        # "Ali@Mail.com" ile "ali@mail.com" aynı e-posta sayılsın
        return value.lower() if value else value


# =============================== YANIT ===============================
class UserOut(BaseModel):
    """Kullanıcı bilgisi. Şifre hash'i ASLA yanıtta bulunmaz."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: str | None
    display_name: str | None
    created_at: datetime


class TokenResponse(BaseModel):
    """Giriş başarılı olunca dönen token."""

    access_token: str
    token_type: str = "bearer"