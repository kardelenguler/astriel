import pytest

from app.models.birth_chart import BirthChart

pytestmark = pytest.mark.db

REGISTER = "/api/v1/auth/register"
LOGIN = "/api/v1/auth/login"
ME = "/api/v1/auth/me"
PASSWORD_URL = "/api/v1/account/password"
ACCOUNT_URL = "/api/v1/account"
CHARTS = "/api/v1/charts"

USERNAME = "hesap_test"
PASSWORD = "eski-sifre-123"


def _register_and_login(client) -> dict[str, str]:
    assert client.post(REGISTER, json={"username": USERNAME, "password": PASSWORD}).status_code == 201
    token = client.post(LOGIN, data={"username": USERNAME, "password": PASSWORD}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _login_status(client, password: str) -> int:
    return client.post(LOGIN, data={"username": USERNAME, "password": password}).status_code


# ------------------------------ Şifre değiştirme ------------------------------
def test_change_password_success(db_client):
    old_headers = _register_and_login(db_client)
    response = db_client.post(
        PASSWORD_URL,
        json={"current_password": PASSWORD, "new_password": "yeni-sifre-456"},
        headers=old_headers,
    )

    assert response.status_code == 200
    assert _login_status(db_client, "yeni-sifre-456") == 200
    assert _login_status(db_client, PASSWORD) == 401

    # Eski şifreyle alınmış token artık geçersiz (başka cihazdaki oturum kapanır)
    old = db_client.get(ME, headers=old_headers)
    assert old.status_code == 401
    assert "Şifren değiştirildiği için" in old.json()["error"]["message"]

    # Şifreyi değiştiren kişi dönen YENİ token'la devam eder
    new_token = response.json()["access_token"]
    me = db_client.get(ME, headers={"Authorization": f"Bearer {new_token}"})
    assert me.status_code == 200

def test_change_password_with_wrong_current_password(db_client):
    headers = _register_and_login(db_client)
    response = db_client.post(
        PASSWORD_URL,
        json={"current_password": "yanlis", "new_password": "yeni-sifre-456"},
        headers=headers,
    )

    # 401 değil 422: kullanıcı çıkışa atılmamalı
    assert response.status_code == 422
    assert response.json()["error"]["message"] == "Mevcut şifre hatalı."
    assert _login_status(db_client, PASSWORD) == 200  # şifre değişmedi


def test_change_password_rejects_short_new_password(db_client):
    headers = _register_and_login(db_client)
    response = db_client.post(
        PASSWORD_URL,
        json={"current_password": PASSWORD, "new_password": "kisa"},
        headers=headers,
    )
    assert response.status_code == 422


def test_change_password_rejects_same_password(db_client):
    headers = _register_and_login(db_client)
    response = db_client.post(
        PASSWORD_URL,
        json={"current_password": PASSWORD, "new_password": PASSWORD},
        headers=headers,
    )
    assert response.status_code == 422


def test_change_password_requires_login(db_client):
    response = db_client.post(
        PASSWORD_URL, json={"current_password": PASSWORD, "new_password": "yeni-sifre-456"}
    )
    assert response.status_code == 401


# ------------------------------ Hesap silme ------------------------------
def test_delete_account_with_wrong_password_keeps_account(db_client):
    headers = _register_and_login(db_client)
    response = db_client.request("DELETE", ACCOUNT_URL, json={"password": "yanlis"}, headers=headers)

    assert response.status_code == 422
    assert _login_status(db_client, PASSWORD) == 200


def test_delete_account_removes_user_and_all_charts(db_client, db_session):
    headers = _register_and_login(db_client)
    chart = {
        "birth_date": "2005-01-26",
        "birth_time": "14:15",
        "latitude": 37.45,
        "longitude": 30.58,
        "name": "Test haritası",
        "place_name": "Bucak",
    }
    assert db_client.post(CHARTS, json=chart, headers=headers).status_code == 201
    user_id = db_client.get(ME, headers=headers).json()["id"]

    response = db_client.request("DELETE", ACCOUNT_URL, json={"password": PASSWORD}, headers=headers)

    assert response.status_code == 204
    assert _login_status(db_client, PASSWORD) == 401           # artık giriş yapılamaz
    assert db_client.get(ME, headers=headers).status_code == 401  # eski token da geçersiz
    remaining = db_session.query(BirthChart).filter(BirthChart.user_id == user_id).count()
    assert remaining == 0                                       # haritaları da silindi


def test_delete_account_requires_login(db_client):
    response = db_client.request("DELETE", ACCOUNT_URL, json={"password": PASSWORD})
    assert response.status_code == 401