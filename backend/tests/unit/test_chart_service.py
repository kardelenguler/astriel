"""chart_service.py birim testleri."""

from datetime import date, time, timedelta

import pytest

from app.core.exceptions import InvalidInputError
from app.schemas.chart import ChartCalculateRequest
from app.services.chart_service import ChartService

service = ChartService()

ANTALYA = {"latitude": 36.8969, "longitude": 30.7133}


def _request(**overrides) -> ChartCalculateRequest:
    data = {"birth_date": date(1995, 6, 15), "birth_time": time(14, 30), **ANTALYA}
    return ChartCalculateRequest(**{**data, **overrides})


def test_full_chart_with_known_time():
    chart = service.calculate(_request())
    assert chart.time_known
    assert chart.house_system.name == "Placidus"
    assert chart.ascendant is not None
    assert len(chart.houses) == 12
    assert len(chart.planets) == 12
    assert all(1 <= p.house <= 12 for p in chart.planets)


def test_sun_sign_is_gemini_on_15_june():
    chart = service.calculate(_request())
    sun = next(p for p in chart.planets if p.key == "sun")
    assert sun.sign.name == "İkizler"


def test_unknown_time_skips_houses():
    chart = service.calculate(_request(birth_time=None))
    assert not chart.time_known
    assert chart.ascendant is None
    assert chart.houses == []
    assert all(p.house is None for p in chart.planets)
    assert any("Doğum saati bilinmediği" in w for w in chart.warnings)


def test_moon_sign_change_warning_appears_on_some_days():
    # Ay ~2,5 günde bir burç değiştirir: 6 ardışık günde hem uyarılı hem uyarısız gün olmalı
    results = []
    for offset in range(6):
        chart = service.calculate(
            _request(birth_date=date(2000, 1, 1) + timedelta(days=offset), birth_time=None)
        )
        results.append(any("Ay bu gün" in w for w in chart.warnings))
    assert any(results) and not all(results)


def test_polar_warning_is_passed_through():
    chart = service.calculate(_request(latitude=70.0, longitude=25.0))
    assert chart.house_system.code == "W"
    assert any("Whole Sign" in w for w in chart.warnings)


def test_nonexistent_local_time_raises():
    # Berlin'in koordinatı: 28 Mart 2021'de saat 02:00'den 03:00'e atlandı
    with pytest.raises(InvalidInputError):
        service.calculate(
            _request(birth_date=date(2021, 3, 28), birth_time=time(2, 30), latitude=52.52, longitude=13.40)
        )


def test_response_is_json_serializable():
    data = service.calculate(_request()).model_dump(mode="json")
    assert data["planets"][0]["sign"]["key"] == "gemini"


@pytest.mark.parametrize(
    ("latitude", "longitude", "expected"),
    [(36.8969, 30.7133, "Europe/Istanbul"), (52.52, 13.40, "Europe/Berlin")],
)
def test_timezone_resolved_from_coordinates(latitude, longitude, expected):
    chart = service.calculate(_request(latitude=latitude, longitude=longitude))
    assert chart.timezone == expected



NEW_YORK = {"latitude": 40.71, "longitude": -74.01}


@pytest.mark.parametrize(
    ("birth_date", "birth_time", "location"),
    [
        # Alt sınır: doğu boylamında gece yarısından sonra -> UTC'de bir önceki gün
        (date(1801, 1, 1), None, ANTALYA),
        (date(1801, 1, 1), time(0, 30), ANTALYA),
        # Üst sınır: batı boylamında gece yarısından önce -> UTC'de bir sonraki gün
        (date(2398, 12, 31), None, NEW_YORK),
        (date(2398, 12, 31), time(23, 30), NEW_YORK),
    ],
)
def test_supported_year_boundaries(birth_date, birth_time, location):
    chart = service.calculate(_request(birth_date=birth_date, birth_time=birth_time, **location))
    assert len(chart.planets) == 12
    # Efemeris dosyası kapsamı dışına düşülürse yedek modele geçilir; bu olmamalı
    assert not any("yedek model" in w for w in chart.warnings)