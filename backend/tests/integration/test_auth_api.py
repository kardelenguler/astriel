"""Kimlik doğrulama API'si: istek -> route -> servis -> veritabanı -> yanıt."""

import pytest

from app.services.auth_service import INVALID_CREDENTIALS

pytestmark = pytest.mark.db

REGISTER = "/api/v1/auth/register"
LOGIN = "/api/v1/auth/login"
ME = "/api/v1/auth/me"

USER = {"username": "kardelen", "password": "gizli-sifre-123"}


def _auth_header(client) -> dict[str, str]:
    """Kayıt olur, giriş yapar ve istek başlığını döndürür."""
    client.post(REGISTER, json=USER)
    token = client.post(LOGIN, data=USER).json()["access_token"]  # form verisi: data=
    return {"Authorization": f"Bearer {token}"}


# =============================== KAYIT ===============================
def test_register(db_client):
    response = db_client.post(REGISTER, json={**USER, "username": "  KarDeLen "})
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "kardelen"
    assert body["email"] is None
    # Şifre veya hash ASLA yanıtta olmamalı
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_duplicate_returns_409(db_client):
    db_client.post(REGISTER, json=USER)
    response = db_client.post(REGISTER, json=USER)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "conflict"


def test_register_short_password_returns_field_error(db_client):
    response = db_client.post(REGISTER, json={**USER, "password": "123"})
    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "password"

def test_register_invalid_email_returns_turkish_field_error(db_client):
    # Angular'ın kontrolünden geçen ama gerçek bir alan adı olmayan e-posta
    response = db_client.post(REGISTER, json={**USER, "email": "ali@mail"})
    assert response.status_code == 422
    [field] = response.json()["error"]["fields"]
    assert field["field"] == "email"
    assert field["message"] == "Geçerli bir e-posta adresi giriniz."


# =============================== GİRİŞ ===============================
def test_login(db_client):
    db_client.post(REGISTER, json=USER)
    response = db_client.post(LOGIN, data=USER)
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(db_client):
    db_client.post(REGISTER, json=USER)
    response = db_client.post(LOGIN, data={**USER, "password": "yanlis-sifre"})
    assert response.status_code == 401
    assert response.json()["error"] == {"code": "unauthorized", "message": INVALID_CREDENTIALS}


# =============================== BEN KİMİM ===============================
def test_me_with_token(db_client):
    response = db_client.get(ME, headers=_auth_header(db_client))
    assert response.status_code == 200
    assert response.json()["username"] == "kardelen"


def test_me_without_token(db_client):
    response = db_client.get(ME)
    assert response.status_code == 401
    assert response.json()["error"] == {"code": "unauthorized", "message": "Lütfen giriş yapın."}
    assert response.headers["www-authenticate"] == "Bearer"  # OAuth2 standardı


def test_me_with_invalid_token(db_client):
    response = db_client.get(ME, headers={"Authorization": "Bearer sahte-token"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"