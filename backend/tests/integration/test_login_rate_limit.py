import pytest

from app.core.rate_limit import MAX_FAILED_ATTEMPTS, REGISTER_LIMIT, REGISTER_LIMIT_MESSAGE

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


# =============================== KAYIT SINIRI ===============================
def _register_user(client, username, headers=None):
    return client.post(
        REGISTER, json={"username": username, "password": PASSWORD}, headers=headers
    )


def test_register_is_limited_per_ip(db_client):
    for i in range(REGISTER_LIMIT):
        assert _register_user(db_client, f"kayit_{i}").status_code == 201

    # Sınır doldu: yeni bir kullanıcı adıyla bile hesap açılamaz
    response = _register_user(db_client, "kayit_fazla")
    assert response.status_code == 429
    assert response.json()["error"]["message"] == REGISTER_LIMIT_MESSAGE


def test_invalid_register_form_is_not_counted(db_client):
    # Kısa şifre (422) endpoint'e ulaşmadan reddedilir; sınırdan hak yemez
    for i in range(REGISTER_LIMIT):
        response = db_client.post(REGISTER, json={"username": f"kisa_{i}", "password": "123"})
        assert response.status_code == 422

    assert _register_user(db_client, "gecerli_kayit").status_code == 201


def test_register_limit_is_separate_for_each_ip(db_client):
    # Render'daki gibi: "kullanıcı IP, Cloudflare, Render" (gerçek IP sondan 3.)
    ip_a = {"X-Forwarded-For": "1.1.1.1, 10.0.0.1, 10.0.0.2"}
    ip_b = {"X-Forwarded-For": "2.2.2.2, 10.0.0.1, 10.0.0.2"}

    for i in range(REGISTER_LIMIT):
        assert _register_user(db_client, f"ip_a_{i}", ip_a).status_code == 201
    assert _register_user(db_client, "ip_a_fazla", ip_a).status_code == 429

    # Başka bir IP'den gelen kullanıcı etkilenmez
    assert _register_user(db_client, "ip_b_kayit", ip_b).status_code == 201