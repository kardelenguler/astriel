"""schemas/chart.py birim testleri."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.astro.ephemeris import julian_day
from app.astro.planets import calculate_planets
from app.schemas.chart import ChartCalculateRequest, ChartCreateRequest, PlanetOut

VALID = {
    "birth_date": "1995-06-15",
    "birth_time": "14:30",
    "latitude": 36.8969,
    "longitude": 30.7133,
}


def test_valid_request():
    request = ChartCalculateRequest(**VALID)
    assert request.house_system == "P"  # varsayılan


def test_birth_time_is_optional():
    request = ChartCalculateRequest(**{**VALID, "birth_time": None})
    assert request.birth_time is None


def test_whitespace_is_stripped():
    request = ChartCreateRequest(**VALID, name="  Benim haritam  ", place_name="Antalya")
    assert request.name == "Benim haritam"



@pytest.mark.parametrize(
    "override",
    [
        {"latitude": 95},
        {"longitude": -200},
        {"birth_date": "1700-01-01"},
        {"birth_date": "1800-01-01"},  # artık desteklenmiyor (efemeris sınırı)
        {"birth_date": "2399-12-31"},  # artık desteklenmiyor (efemeris sınırı)
        {"house_system": "X"},
        {"birth_date": "tarih-değil"},
        {"birth_time": "14:30Z"},  # saat dilimli saat reddedilmeli
        {"birth_time": "14:30+03:00"},  # saat dilimli saat reddedilmeli
    ],
)
def test_invalid_requests_rejected(override):
    with pytest.raises(ValidationError):
        ChartCalculateRequest(**{**VALID, **override}) 





def test_create_request_rejects_blank_name():
    with pytest.raises(ValidationError):
        ChartCreateRequest(**VALID, name="   ", place_name="Antalya")


def test_planet_out_from_engine_dataclass():
    jd = julian_day(datetime(2000, 3, 20, 7, 35, tzinfo=timezone.utc))
    sun = calculate_planets(jd).planets[0]
    out = PlanetOut.model_validate(sun)
    assert out.key == "sun"
    assert out.sign.name == sun.sign.name 