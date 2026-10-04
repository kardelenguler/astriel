"""Beklenmeyen hataların yanıt biçimi testleri."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_unexpected_error_returns_json_with_cors_headers():
    # Test için ayrı bir uygulama: içine bilerek hata fırlatan bir route ekliyoruz
    app = create_app()

    @app.get("/boom")
    def boom():
        raise RuntimeError("bilerek fırlatılan test hatası")

    client = TestClient(app)
    response = client.get("/boom", headers={"Origin": "http://localhost:4200"})

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    # Asıl kontrol: Angular'ın hatayı okuyabilmesi için CORS başlığı olmalı
    assert response.headers["access-control-allow-origin"] == "http://localhost:4200"


def test_unknown_url_returns_error_format(client):
    response = client.get("/api/v1/olmayan-adres")
    assert response.status_code == 404
    assert response.json() == {
        "error": {"code": "not_found", "message": "Aradığınız adres bulunamadı."}
    }


def test_wrong_method_returns_error_format(client):
    # /charts/calculate sadece POST kabul eder
    response = client.get("/api/v1/charts/calculate")
    assert response.status_code == 405
    assert response.json()["error"]["code"] == "method_not_allowed"
    assert "POST" in response.headers["allow"]