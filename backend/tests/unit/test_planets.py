"""planets.py birim testleri."""

from datetime import datetime, timezone

from app.astro.ephemeris import julian_day
from app.astro.houses import calculate_houses
from app.astro.planets import BODIES, calculate_planets

JD_EQUINOX = julian_day(datetime(2000, 3, 20, 7, 35, tzinfo=timezone.utc))
# 10 Nisan 2024: Merkür retro dönemindeydi (1–25 Nisan 2024)
JD_MERCURY_RETRO = julian_day(datetime(2024, 4, 10, 12, 0, tzinfo=timezone.utc))


def _by_key(result):
    return {p.key: p for p in result.planets}


def test_all_bodies_calculated_from_files():
    result = calculate_planets(JD_EQUINOX)
    assert len(result.planets) == len(BODIES)
    assert not result.used_fallback_model
    assert result.warnings == ()


def test_formatted_position_matches_sign():
    # zodiac.py'de düzelttiğimiz türden tutarsızlıkları her gezegen için yakalar
    for planet in calculate_planets(JD_EQUINOX).planets:
        assert planet.formatted.endswith(planet.sign.name), planet.key


def test_mercury_retrograde_in_april_2024():
    planets = _by_key(calculate_planets(JD_MERCURY_RETRO))
    assert planets["mercury"].retrograde
    assert not planets["sun"].retrograde


def test_no_houses_without_cusps():
    for planet in calculate_planets(JD_EQUINOX).planets:
        assert planet.house is None


def test_houses_assigned_with_cusps():
    houses = calculate_houses(JD_EQUINOX, 36.9, 30.7, "P")
    result = calculate_planets(JD_EQUINOX, houses.cusp_longitudes)
    for planet in result.planets:
        assert planet.house is not None and 1 <= planet.house <= 12