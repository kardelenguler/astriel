"""Şifre hash'leme ve giriş token'ları (JWT).

- Şifreler asla düz metin saklanmaz; Argon2 ile hash'lenir.
- Token'da sadece kullanıcı id'si (sub) ve bitiş zamanı (exp) bulunur.
  Token'ın içi herkes tarafından okunabilir (şifreli değil, sadece imzalı);
  bu yüzden içine asla şifre, e-posta gibi bilgi konmaz.
"""

import uuid
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.exceptions import AuthenticationError

ALGORITHM = "HS256"

# Argon2, kütüphanenin önerdiği güvenli ayarlarla
_password_hash = PasswordHash.recommended()


# =============================== ŞİFRE ===============================
def hash_password(password: str) -> str:
    """Şifreyi hash'ler. Aynı şifre her seferinde farklı hash verir (rastgele tuz)."""
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Girilen şifre, kayıtlı hash ile eşleşiyor mu?"""
    return _password_hash.verify(password, hashed)


# =============================== TOKEN ===============================
def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,  # oluşturulma zamanı
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key.get_secret_value(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> uuid.UUID:
    """Token'ı doğrular ve içindeki kullanıcı id'sini döndürür.

    Süresi dolmuş, imzası tutmayan veya bozuk token -> AuthenticationError (401).
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[ALGORITHM],  # sadece bizim algoritmamız kabul edilir
            options={"require": ["sub", "exp"]},
        )
        return uuid.UUID(payload["sub"])
    except jwt.ExpiredSignatureError as exc:
        # Bu kontrol aşağıdakinden ÖNCE olmalı: ExpiredSignatureError, InvalidTokenError'ın alt sınıfı
        raise AuthenticationError(
            "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
            detail="token süresi dolmuş",
        ) from exc
    except (jwt.InvalidTokenError, ValueError) as exc:
        # ValueError: 'sub' geçerli bir UUID değilse
        raise AuthenticationError(detail=f"geçersiz token: {exc}") from exc 