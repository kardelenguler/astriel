"""Harita API'si entegrasyon testleri: istek -> route -> servis -> motor -> yanıt."""

import pytest

URL = "/api/v1/charts/calculate"
SOLAR_RETURN_URL = "/api/v1/charts/solar-return"
PROGRESSED_URL = "/api/v1/charts/progressed"

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




def test_calculate_returns_special_points(client):
    data = client.post(URL, json=VALID).json()
    keys = [p["key"] for p in data["special_points"]]
    assert keys == ["south_node", "lilith", "juno", "part_of_fortune"]
    assert all(p["sign"]["key"] and 1 <= p["house"] <= 12 for p in data["special_points"])


# =============================== SOLAR RETURN ===============================
def test_solar_return_success(client):
    natal = client.post(URL, json=VALID).json()
    natal_sun = next(p["longitude"] for p in natal["planets"] if p["key"] == "sun")

    response = client.post(SOLAR_RETURN_URL, json={**VALID, "year": 2026})
    assert response.status_code == 200
    data = response.json()
    assert data["year"] == 2026
    assert data["used_birth_place"] is True
    assert data["chart"]["time_known"] is True
    assert len(data["chart"]["houses"]) == 12
    assert data["chart"]["utc_datetime"].startswith("2026-06-1")  # doğum gününe yakın

    sun = next(p["longitude"] for p in data["chart"]["planets"] if p["key"] == "sun")
    assert sun == pytest.approx(natal_sun, abs=1e-4)


def test_solar_return_for_another_place(client):
    response = client.post(
        SOLAR_RETURN_URL,
        json={**VALID, "year": 2026, "return_latitude": 52.52, "return_longitude": 13.40},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["used_birth_place"] is False
    assert data["chart"]["timezone"] == "Europe/Berlin"


def test_solar_return_year_must_be_after_birth_year(client):
    response = client.post(SOLAR_RETURN_URL, json={**VALID, "year": 1995})
    assert response.status_code == 422
    field_error = response.json()["error"]["fields"][0]
    assert field_error["field"] == "year"
    assert "doğum yılından sonra" in field_error["message"]


def test_solar_return_requires_both_coordinates(client):
    response = client.post(SOLAR_RETURN_URL, json={**VALID, "year": 2026, "return_latitude": 52.52})
    assert response.status_code == 422
    field_error = response.json()["error"]["fields"][0]
    assert field_error["field"] == "return_longitude"


# =============================== İLERLETİLMİŞ HARİTA ===============================
def test_progressed_success(client):
    response = client.post(PROGRESSED_URL, json={**VALID, "target_date": "2025-06-15"})
    assert response.status_code == 200
    data = response.json()
    assert data["target_date"] == "2025-06-15"
    assert data["age_years"] == pytest.approx(30.0, abs=0.01)
    assert data["chart"]["utc_datetime"].startswith("1995-07-1")  # doğumdan ~30 gün sonra
    assert len(data["chart"]["houses"]) == 12
    assert data["next_moon_sign_change"]["change_date"] > "2025-06-15"
    assert data["next_moon_sign_change"]["sign"]["key"]


def test_progressed_target_must_be_after_birth(client):
    response = client.post(PROGRESSED_URL, json={**VALID, "target_date": "1995-06-15"})
    assert response.status_code == 422
    field_error = response.json()["error"]["fields"][0]
    assert field_error["field"] == "target_date"
    assert "doğum tarihinden sonra" in field_error["message"]