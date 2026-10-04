"""Harita API'si entegrasyon testleri: istek -> route -> servis -> motor -> yanıt."""

import pytest

URL = "/api/v1/charts/calculate"

VALID = {
    "birth_date": "1995-06-15",
    "birth_time": "14:30",
    "latitude": 36.8969,
    "longitude": 30.7133,
}

@pytest.mark.db
def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_calculate_success(client):
    response = client.post(URL, json=VALID)
    assert response.status_code == 200
    data = response.json()
    assert data["time_known"] is True
    assert data["timezone"] == "Europe/Istanbul"
    assert len(data["planets"]) == 12
    assert len(data["houses"]) == 12
    assert data["ascendant"]["sign"]["key"] == "libra"
    assert data["warnings"] == []  # yedek model veya eksik gezegen uyarısı olmamalı

def test_validation_error_format(client):
    response = client.post(URL, json={**VALID, "latitude": 95})
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "invalid_input"
    assert error["fields"][0]["field"] == "latitude"
    assert error["fields"][0]["message"] == "En fazla 90 olabilir."



def test_custom_validator_message_is_turkish(client):
    response = client.post(URL, json={**VALID, "birth_date": "1700-01-01"})
    assert response.status_code == 422
    message = response.json()["error"]["fields"][0]["message"]
    assert message.startswith("Doğum yılı")  # "Value error, " öneki temizlenmiş olmalı


def test_business_rule_error_format(client):
    # Berlin: 28 Mart 2021'de 02:30 hiç yaşanmadı
    response = client.post(
        URL,
        json={**VALID, "birth_date": "2021-03-28", "birth_time": "02:30",
              "latitude": 52.52, "longitude": 13.40},
    )
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "invalid_input"
    assert "hiç yaşanmadı" in error["message"]
    assert "fields" not in error


def test_missing_body_field(client):
    body = {k: v for k, v in VALID.items() if k != "latitude"}
    response = client.post(URL, json=body)
    assert response.status_code == 422
    field_error = response.json()["error"]["fields"][0]
    assert field_error["field"] == "latitude"
    assert field_error["message"] == "Bu alan zorunludur."



def test_timezone_aware_birth_time_rejected(client):
    response = client.post(URL, json={**VALID, "birth_time": "14:30Z"})
    assert response.status_code == 422
    field_error = response.json()["error"]["fields"][0]
    assert field_error["field"] == "birth_time"
    assert "yerel saat" in field_error["message"]
    assert "hiç yaşanmadı" not in field_error["message"]