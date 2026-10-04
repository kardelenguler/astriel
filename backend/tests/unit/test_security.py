"""security.py birim testleri."""

import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import (
    ALGORITHM,
    create_access_token,
    decode_access_token,
    hash_password,
    password_fingerprint,
    read_access_token,
    verify_password,
)


# =============================== ŞİFRE ===============================
def test_password_is_not_stored_as_plain_text():
    hashed = hash_password("gizli-sifre-123")
    assert hashed != "gizli-sifre-123"
    assert hashed.startswith("$argon2")


def test_verify_password():
    hashed = hash_password("gizli-sifre-123")
    assert verify_password("gizli-sifre-123", hashed)
    assert not verify_password("yanlis-sifre", hashed)


def test_same_password_gives_different_hashes():
    # Rastgele tuz sayesinde: iki kullanıcının şifresi aynı olsa da hash'leri farklıdır
    assert hash_password("abc12345") != hash_password("abc12345")


def test_password_fingerprint_changes_with_password():
    first = password_fingerprint(hash_password("gizli-sifre-123"))
    second = password_fingerprint(hash_password("yeni-sifre-456"))
    assert first != second


# =============================== TOKEN ===============================
def _make_token(payload: dict, secret: str | None = None) -> str:
    """Test için elle token üretir (bozuk/eksik token senaryoları için)."""
    key = secret or settings.secret_key.get_secret_value()
    return jwt.encode(payload, key, algorithm=ALGORITHM)


def _in(minutes: int) -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)


def test_token_round_trip():
    user_id = uuid.uuid4()
    assert decode_access_token(create_access_token(user_id)) == user_id


def test_token_carries_password_fingerprint():
    user_id = uuid.uuid4()
    fingerprint = password_fingerprint(hash_password("gizli-sifre-123"))
    data = read_access_token(create_access_token(user_id, fingerprint))
    assert data.user_id == user_id
    assert data.fingerprint == fingerprint


def test_expired_token_has_friendly_message():
    token = _make_token({"sub": str(uuid.uuid4()), "exp": _in(-1)})
    with pytest.raises(AuthenticationError) as exc_info:
        decode_access_token(token)
    assert "süresi doldu" in exc_info.value.message


@pytest.mark.parametrize(
    "token",
    [
        "bu-bir-token-degil",
        # Başka bir anahtarla imzalanmış (sahte) token
        _make_token({"sub": str(uuid.uuid4()), "exp": _in(5)}, secret="x" * 40),
        # Bitiş zamanı yok
        _make_token({"sub": str(uuid.uuid4())}),
        # Kullanıcı id'si yok
        _make_token({"exp": _in(5)}),
        # Kullanıcı id'si UUID değil
        _make_token({"sub": "123", "exp": _in(5)}),
    ],
    ids=["bozuk", "sahte-imza", "exp-yok", "sub-yok", "sub-uuid-degil"],
)
def test_invalid_tokens_rejected(token):
    with pytest.raises(AuthenticationError):
        decode_access_token(token)
        