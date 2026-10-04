import pytest

from app.core.rate_limit import MAX_FAILED_ATTEMPTS

pytestmark = pytest.mark.db

REGISTER = "/api/v1/auth/register"
LOGIN = "/api/v1/auth/login"
USERNAME = "deneme_kilit"
PASSWORD = "dogru-sifre-123"


def _register(client):
    response = client.post(REGISTER, json={"username": USERNAME, "password": PASSWORD})
    assert response.status_code == 201


def _login(client, password):
    return client.post(LOGIN, data={"username": USERNAME, "password": password})


def test_login_is_locked_after_too_many_failures(db_client):
    _register(db_client)
    for _ in range(MAX_FAILED_ATTEMPTS):
        assert _login(db_client, "yanlis-sifre").status_code == 401

    # Sınır aşıldı: doğru şifre bile kabul edilmez
    response = _login(db_client, PASSWORD)
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "too_many_requests"


def test_successful_login_resets_the_counter(db_client):
    _register(db_client)
    for _ in range(MAX_FAILED_ATTEMPTS - 1):
        assert _login(db_client, "yanlis-sifre").status_code == 401
    assert _login(db_client, PASSWORD).status_code == 200

    # Sayaç sıfırlandığı için tekrar 4 hatalı deneme yapılabilir
    for _ in range(MAX_FAILED_ATTEMPTS - 1):
        assert _login(db_client, "yanlis-sifre").status_code == 401
    assert _login(db_client, PASSWORD).status_code == 200