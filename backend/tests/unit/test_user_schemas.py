"""schemas/user.py birim testleri."""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate

VALID = {"username": "kardelen", "password": "gizli-sifre-123"}


# =============================== ZORUNLU ALANLAR ===============================
def test_only_username_and_password_required():
    user = UserCreate(**VALID)
    assert user.email is None
    assert user.display_name is None


# =============================== KULLANICI ADI ===============================
def test_username_is_normalized():
    user = UserCreate(**{**VALID, "username": "  Kardelen_95 "})
    assert user.username == "kardelen_95"


@pytest.mark.parametrize(
    "username",
    ["ab", "a" * 31, "kar delen", "kardelen!", "şeyma", ""],
    ids=["cok-kisa", "cok-uzun", "bosluk", "ozel-karakter", "turkce-harf", "bos"],
)
def test_invalid_usernames_rejected(username):
    with pytest.raises(ValidationError):
        UserCreate(**{**VALID, "username": username})


# =============================== ŞİFRE ===============================
def test_password_is_not_stripped():
    user = UserCreate(**{**VALID, "password": "  bosluklu sifre  "})
    assert user.password == "  bosluklu sifre  "


@pytest.mark.parametrize("password", ["1234567", "x" * 129], ids=["cok-kisa", "cok-uzun"])
def test_invalid_passwords_rejected(password):
    with pytest.raises(ValidationError):
        UserCreate(**{**VALID, "password": password})


# =============================== E-POSTA ===============================
def test_blank_optional_fields_become_none():
    # Angular formunda boş bırakılan alanlar "" olarak gelir
    user = UserCreate(**{**VALID, "email": "   ", "display_name": ""})
    assert user.email is None
    assert user.display_name is None


def test_email_is_normalized():
    user = UserCreate(**{**VALID, "email": " Ali@Mail.COM "})
    assert user.email == "ali@mail.com"


def test_invalid_email_rejected():
    with pytest.raises(ValidationError):
        UserCreate(**{**VALID, "email": "mail-degil"})