"""Kayıtlı haritalar API'si: istek -> route -> servis -> veritabanı -> yanıt."""

import uuid

import pytest

pytestmark = pytest.mark.db

CHARTS = "/api/v1/charts"

CHART = {
    "name": "Benim haritam",
    "place_name": "Antalya",
    "birth_date": "1995-06-15",
    "birth_time": "14:30",
    "latitude": 36.8969,
    "longitude": 30.7133,
}


def _login(client, username: str) -> dict[str, str]:
    """Kullanıcı oluşturur, giriş yapar ve istek başlığını döndürür."""
    user = {"username": username, "password": "gizli-sifre-123"}
    client.post("/api/v1/auth/register", json=user)
    token = client.post("/api/v1/auth/login", data=user).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def owner(db_client) -> dict[str, str]:
    return _login(db_client, "sahip")


def _save(client, headers, **overrides) -> dict:
    response = client.post(CHARTS, json={**CHART, **overrides}, headers=headers)
    assert response.status_code == 201
    return response.json()


# =============================== KAYDET ===============================
def test_save_requires_login(db_client):
    response = db_client.post(CHARTS, json=CHART)
    assert response.status_code == 401


def test_save(db_client, owner):
    body = _save(db_client, owner)
    assert body["name"] == "Benim haritam"
    assert body["chart"]["ascendant"]["sign"]["key"] == "libra"
    assert len(body["chart"]["planets"]) == 12


# =============================== LİSTE ===============================
def test_list_pagination(db_client, owner):
    _save(db_client, owner, name="Birinci")
    _save(db_client, owner, name="İkinci")
    body = db_client.get(CHARTS, params={"limit": 1}, headers=owner).json()
    assert body["total"] == 2
    assert len(body["items"]) == 1
    assert body["items"][0]["sun_sign"]["key"] == "gemini"


def test_list_limit_is_capped(db_client, owner):
    response = db_client.get(CHARTS, params={"limit": 1000}, headers=owner)
    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "limit"


# =============================== TEK HARİTA ===============================
def test_other_users_chart_returns_404(db_client, owner):
    chart_id = _save(db_client, owner)["id"]
    stranger = _login(db_client, "yabanci")
    response = db_client.get(f"{CHARTS}/{chart_id}", headers=stranger)
    assert response.status_code == 404  # 403 DEĞİL: haritanın varlığı ele verilmemeli
    assert response.json()["error"]["message"] == "Harita bulunamadı."


def test_invalid_chart_id_returns_404(db_client, owner):
    response = db_client.get(f"{CHARTS}/uuid-degil", headers=owner)
    assert response.status_code == 404


# =============================== AD DEĞİŞTİR ===============================
def test_rename(db_client, owner):
    chart_id = _save(db_client, owner)["id"]
    response = db_client.patch(f"{CHARTS}/{chart_id}", json={"name": "Yeni ad"}, headers=owner)
    assert response.status_code == 200
    assert response.json()["name"] == "Yeni ad"


def test_rename_to_blank_rejected(db_client, owner):
    chart_id = _save(db_client, owner)["id"]
    response = db_client.patch(f"{CHARTS}/{chart_id}", json={"name": "   "}, headers=owner)
    assert response.status_code == 422


# =============================== SİL / GERİ AL ===============================
def test_delete_and_restore_flow(db_client, owner):
    chart_id = _save(db_client, owner)["id"]
    url = f"{CHARTS}/{chart_id}"

    assert db_client.delete(url, headers=owner).status_code == 204
    assert db_client.get(url, headers=owner).status_code == 404
    assert db_client.get(CHARTS, headers=owner).json()["total"] == 0

    assert db_client.post(f"{url}/restore", headers=owner).status_code == 200
    assert db_client.get(url, headers=owner).status_code == 200 