"""İlerletilmiş harita (secondary progression) birim testleri."""

from datetime import date, time

import pytest
from pydantic import ValidationError

from app.schemas.chart import ChartCalculateRequest, ProgressedRequest
from app.services.chart_service import ChartService

service = ChartService()

ANTALYA = {"latitude": 36.8969, "longitude": 30.7133}
BIRTH = date(1995, 6, 15)


def _longitude(chart, key: str) -> float:
    return next(p.longitude for p in chart.planets if p.key == key)


def _natal(birth_time: time | None = time(14, 30)):
    return service.calculate(
        ChartCalculateRequest(birth_date=BIRTH, birth_time=birth_time, **ANTALYA)
    )


def _progressed(target: date = date(2025, 6, 15), birth_time: time | None = time(14, 30)):
    return service.progressed(
        ProgressedRequest(birth_date=BIRTH, birth_time=birth_time, target_date=target, **ANTALYA)
    )


def _advance(after: float, before: float) -> float:
    """İki boylam arasındaki ileri yöndeki fark (0–360)"""
    return (after - before) % 360


def test_age_in_years():
    result = _progressed(date(2025, 6, 15))
    assert result.age_years == pytest.approx(30.0, abs=0.01)


def test_progressed_moment_is_about_age_in_days_after_birth():
    # 30 yaşında: doğumdan yaklaşık 30 gün sonra (15 Temmuz 1995)
    moment = _progressed(date(2025, 6, 15)).chart.utc_datetime
    assert moment.year == 1995 and moment.month == 7
    assert 14 <= moment.day <= 16


def test_progressed_sun_moves_about_one_degree_per_year():
    natal_sun = _longitude(_natal(), "sun")
    result = _progressed(date(2005, 6, 15))  # 10 yaş
    moved = _advance(_longitude(result.chart, "sun"), natal_sun)
    assert 9.0 < moved < 10.5


def test_progressed_moon_moves_about_thirteen_degrees_per_year():
    natal_moon = _longitude(_natal(), "moon")
    result = _progressed(date(1996, 6, 15))  # 1 yaş
    moved = _advance(_longitude(result.chart, "moon"), natal_moon)
    assert 10 < moved < 16


def test_progressed_chart_has_houses_when_time_is_known():
    chart = _progressed().chart
    assert chart.time_known is True
    assert chart.ascendant is not None
    assert len(chart.houses) == 12


def test_unknown_birth_time_skips_houses_and_warns():
    chart = _progressed(birth_time=None).chart
    assert chart.time_known is False
    assert chart.ascendant is None
    assert chart.houses == []
    assert any("Doğum saati bilinmediği" in warning for warning in chart.warnings)


def test_next_moon_sign_change_is_ahead_and_into_a_new_sign():
    target = date(2025, 6, 15)
    result = _progressed(target)
    change = result.next_moon_sign_change

    current_moon_sign = next(p.sign.key for p in result.chart.planets if p.key == "moon")
    assert change.sign.key != current_moon_sign
    assert change.change_date > target
    # İlerletilmiş Ay yaklaşık 2,5 yılda bir burç değiştirir
    assert (change.change_date - target).days < 1000


def test_target_must_be_after_birth():
    with pytest.raises(ValidationError) as error:
        _progressed(target=BIRTH)
    assert "doğum tarihinden sonra" in str(error.value)