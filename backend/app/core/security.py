"""Şifre hash'leme ve giriş token'ları (JWT).

- Şifreler asla düz metin saklanmaz; Argon2 ile hash'lenir.
- Token'da kullanıcı id'si (sub), bitiş zamanı (exp) ve şifrenin parmak izi (pwd) bulunur.
  Token'ın içi herkes tarafından okunabilir (şifreli değil, sadece imzalı);
  bu yüzden içine asla şifre, e-posta gibi bilgi konmaz. Parmak izi şifrenin
  kendisi değil, hash'inin özetidir; ondan şifre bulunamaz.
"""

import hashlib
import uuid
from dataclasses import dataclass
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


def password_fingerprint(hashed_password: str) -> str:
    """Kayıtlı şifre hash'inin kısa özeti. Şifre değişince bu da değişir;
    böylece eski şifreyle alınmış token'lar geçersiz sayılır."""
    return hashlib.sha256(hashed_password.encode()).hexdigest()[:16]


# =============================== TOKEN ===============================
@dataclass(frozen=True)
class TokenData:
    user_id: uuid.UUID
    fingerprint: str | None  # token alınırken geçerli olan şifrenin parmak izi


def create_access_token(user_id: uuid.UUID, fingerprint: str | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict = {
        "sub": str(user_id),
        "iat": now,  # oluşturulma zamanı
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    if fingerprint is not None:
        payload["pwd"] = fingerprint
    return jwt.encode(payload, settings.secret_key.get_secret_value(), algorithm=ALGORITHM)


def read_access_token(token: str) -> TokenData:
    """Token'ı doğrular ve içindeki bilgileri döndürür.

    Süresi dolmuş, imzası tutmayan veya bozuk token -> AuthenticationError (401).
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[ALGORITHM],  # sadece bizim algoritmamız kabul edilir
            options={"require": ["sub", "exp"]},
        )
        return TokenData(user_id=uuid.UUID(payload["sub"]), fingerprint=payload.get("pwd"))
    except jwt.ExpiredSignatureError as exc:
        # Bu kontrol aşağıdakinden ÖNCE olmalı: ExpiredSignatureError, InvalidTokenError'ın alt sınıfı
        raise AuthenticationError(
            "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
            detail="token süresi dolmuş",
        ) from exc
    except (jwt.InvalidTokenError, ValueError) as exc:
        # ValueError: 'sub' geçerli bir UUID değilse
        raise AuthenticationError(detail=f"geçersiz token: {exc}") from exc


def decode_access_token(token: str) -> uuid.UUID:
    """Token'ı doğrular ve sadece kullanıcı id'sini döndürür."""
    return read_access_token(token).user_id