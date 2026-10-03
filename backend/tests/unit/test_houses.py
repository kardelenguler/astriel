"""houses.py birim testleri."""

from datetime import datetime, timezone

import pytest

from app.astro.ephemeris import julian_day
from app.astro.houses import calculate_houses, house_of
from app.core.exceptions import InvalidInputError

JD = julian_day(datetime(2000, 3, 20, 7, 35, tzinfo=timezone.utc))
ANTALYA = (36.9, 30.7)


# ---------- house_of ----------
def test_house_of_simple():
    cusps = [30 * i for i in range(12)]  # 0°, 30°, 60°, ...
    assert house_of(15, cusps) == 1
    assert house_of(45, cusps) == 2
    assert house_of(359, cusps) == 12


def test_house_of_wraps_around_0_degrees():
    cusps = [(350 + 30 * i) % 360 for i in range(12)]  # 1. ev 350°'den başlıyor
    assert house_of(355, cusps) == 1
    assert house_of(5, cusps) == 1  # 0°'yi geçti ama hâlâ 1. ev
    assert house_of(20, cusps) == 2
    assert house_of(349, cusps) == 12


def test_house_of_requires_12_cusps():
    with pytest.raises(ValueError):
        house_of(10, [0, 30, 60])


# ---------- calculate_houses ----------
def test_placidus_result():
    result = calculate_houses(JD, *ANTALYA, "P")
    assert result.system_name == "Placidus"
    assert len(result.cusps) == 12
    assert result.ascendant.longitude == pytest.approx(result.cusps[0].longitude)
    assert result.warnings == ()


def test_whole_sign_cusps_start_at_sign_boundaries():
    result = calculate_houses(JD, *ANTALYA, "W")
    for cusp in result.cusps:
        assert cusp.longitude % 30 == pytest.approx(0, abs=1e-9)


def test_polar_latitude_falls_back_to_whole_sign():
    result = calculate_houses(JD, 70.0, 25.0, "P")  # Kuzey Norveç
    assert result.system_code == "W"
    assert len(result.warnings) == 1


def test_invalid_house_system_raises():
    with pytest.raises(InvalidInputError):
        calculate_houses(JD, *ANTALYA, "X") 