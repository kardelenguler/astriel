"""aspects.py birim testleri."""

from datetime import datetime, timezone

import pytest

from app.astro.aspects import angular_distance, find_aspects
from app.astro.ephemeris import julian_day
from app.astro.planets import PlanetPosition, calculate_planets
from app.astro.zodiac import degree_in_sign, format_position, sign_of


def _planet(key: str, longitude: float, speed: float = 0.0) -> PlanetPosition:
    """Test için istenen konumda sahte bir gezegen oluşturur."""
    return PlanetPosition(
        key=key,
        name=key,
        longitude=longitude,
        sign=sign_of(longitude),
        degree=degree_in_sign(longitude),
        formatted=format_position(longitude),
        speed=speed,
        retrograde=speed < 0,
        house=None,
    )


@pytest.mark.parametrize(
    ("a", "b", "expected"),
    [(0, 180, 180), (350, 10, 20), (10, 350, 20), (0, 0, 0), (90, 270, 180)],
)
def test_angular_distance(a, b, expected):
    assert angular_distance(a, b) == pytest.approx(expected)


def test_exact_trine():
    aspects = find_aspects([_planet("a", 10), _planet("b", 130)])
    assert len(aspects) == 1
    assert aspects[0].type.key == "trine"
    assert aspects[0].orb == pytest.approx(0)


def test_conjunction_across_0_degrees():
    aspects = find_aspects([_planet("a", 357), _planet("b", 3)])
    assert aspects[0].type.key == "conjunction"
    assert aspects[0].orb == pytest.approx(6)


def test_no_aspect_outside_orb():
    assert find_aspects([_planet("a", 0), _planet("b", 45)]) == ()


def test_applying_and_separating():
    # a, b'ye yaklaşıyor -> uygulanan
    approaching = find_aspects([_planet("a", 0, speed=1.0), _planet("b", 5)])
    assert approaching[0].applying
    # a, b'yi geçti ve uzaklaşıyor -> ayrılan
    leaving = find_aspects([_planet("a", 10, speed=1.0), _planet("b", 5)])
    assert not leaving[0].applying


def test_sorted_by_orb():
    aspects = find_aspects([_planet("a", 0), _planet("b", 93), _planet("c", 121)])
    orbs = [a.orb for a in aspects]
    assert orbs == sorted(orbs)


def test_real_chart_aspects_are_within_orb():
    jd = julian_day(datetime(2000, 3, 20, 7, 35, tzinfo=timezone.utc))
    for aspect in find_aspects(calculate_planets(jd).planets):
        assert aspect.orb <= aspect.type.orb 




def test_moon_very_close_to_exact_is_still_applying():
    # Eski yöntemin hatası: Ay 0.01 günde ~0.13° ilerler, 0.05° orb'lu açıyı "geçip"
    # ayrılan sanıyordu. Yeni yöntem türev kullandığı için doğru sonuç verir.
    sun = _planet("sun", 100.0, speed=1.0)
    moon = _planet("moon", 99.95, speed=13.0)
    aspects = find_aspects([sun, moon])
    assert aspects[0].type.key == "conjunction"
    assert aspects[0].orb == pytest.approx(0.05)
    assert aspects[0].applying


def test_opposition_near_180_applying():
    # Mesafe 0–180'e katlandığı için karşıtlık ayrıca test edilmeli
    fast = _planet("a", 0.0, speed=13.0)
    still = _planet("b", 180.05)  # karşıtlık noktası 0.05°, a oraya doğru gidiyor
    aspects = find_aspects([fast, still])
    assert aspects[0].type.key == "opposition"
    assert aspects[0].applying  