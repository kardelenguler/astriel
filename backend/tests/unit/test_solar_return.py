"""Solar Return (Güneş dönüşü) birim testleri."""

from datetime import date, time

import pytest
from pydantic import ValidationError

from app.astro import ephemeris
from app.astro.solar_return import find_solar_return
from app.schemas.chart import ChartCalculateRequest, SolarReturnRequest
from app.services.chart_service import ChartService

service = ChartService()

ANTALYA = {"latitude": 36.8969, "longitude": 30.7133}
BERLIN = {"return_latitude": 52.52, "return_longitude": 13.40}


def _sun(chart) -> float:
    return next(p.longitude for p in chart.planets if p.key == "sun")


def _natal_sun(birth_date: date, birth_time: time | None) -> float:
    chart = service.calculate(
        ChartCalculateRequest(birth_date=birth_date, birth_time=birth_time, **ANTALYA)
    )
    return _sun(chart)


def _solar_return(year: int = 2026, birth_time: time | None = time(14, 30), **extra):
    request = SolarReturnRequest(
        birth_date=date(1995, 6, 15), birth_time=birth_time, year=year, **ANTALYA, **extra
    )
    return service.solar_return(request)


def test_find_solar_return_hits_natal_sun_longitude():
    natal = _natal_sun(date(1995, 6, 15), time(14, 30))
    jd = find_solar_return(natal, 2026, 6, 15)
    assert ephemeris.calc_body(jd, "sun").longitude == pytest.approx(natal, abs=1e-5)


def test_solar_return_moment_is_near_the_birthday():
    natal = _natal_sun(date(1995, 6, 15), time(14, 30))
    moment = ephemeris.utc_from_julian_day(find_solar_return(natal, 2026, 6, 15))
    assert moment.year == 2026 and moment.month == 6
    assert 14 <= moment.day <= 16


def test_leap_day_birth_in_a_common_year():
    natal = _natal_sun(date(2000, 2, 29), time(12, 0))
    moment = ephemeris.utc_from_julian_day(find_solar_return(natal, 2025, 2, 29))
    assert moment.year == 2025
    assert moment.month in (2, 3)


def test_solar_return_chart_has_the_natal_sun_position():
    natal = _natal_sun(date(1995, 6, 15), time(14, 30))
    result = _solar_return()
    assert result.year == 2026
    assert result.used_birth_place is True
    assert result.chart.time_known is True
    assert result.chart.ascendant is not None
    assert len(result.chart.houses) == 12
    assert _sun(result.chart) == pytest.approx(natal, abs=1e-4)


def test_other_place_changes_houses_but_not_the_sun():
    natal = _natal_sun(date(1995, 6, 15), time(14, 30))
    result = _solar_return(**BERLIN)
    assert result.used_birth_place is False
    assert result.chart.timezone == "Europe/Berlin"
    assert _sun(result.chart) == pytest.approx(natal, abs=1e-4)


def test_unknown_birth_time_adds_an_approximation_warning():
    result = _solar_return(birth_time=None)
    assert any("yaklaşık" in warning for warning in result.chart.warnings)
    assert result.chart.time_known is True  # Güneş dönüşü anı kesin bir an olduğundan


def test_year_must_be_after_birth_year():
    with pytest.raises(ValidationError) as error:
        _solar_return(year=1995)
    assert "doğum yılından sonra" in str(error.value)


def test_return_coordinates_must_come_together():
    with pytest.raises(ValidationError):
        _solar_return(return_latitude=52.52)
    with pytest.raises(ValidationError):
        _solar_return(return_longitude=13.40)