"""special_points.py birim testleri."""

from datetime import date, time

import pytest

from app.schemas.chart import ChartCalculateRequest
from app.services.chart_service import ChartService

service = ChartService()

ANTALYA = {"latitude": 36.8969, "longitude": 30.7133}


def _chart(birth_time: time | None):
    request = ChartCalculateRequest(
        birth_date=date(1995, 6, 15), birth_time=birth_time, **ANTALYA
    )
    return service.calculate(request)


def _by_key(items):
    return {item.key: item for item in items}


def test_south_node_is_opposite_north_node():
    chart = _chart(time(14, 30))
    north = _by_key(chart.planets)["north_node"]
    south = _by_key(chart.special_points)["south_node"]
    assert south.longitude == pytest.approx((north.longitude + 180.0) % 360.0)


def test_all_special_points_present_with_known_time():
    chart = _chart(time(14, 30))
    keys = [p.key for p in chart.special_points]
    assert keys == ["south_node", "lilith", "juno", "part_of_fortune"]
    assert chart.warnings == []


def test_formatted_position_matches_sign():
    for point in _chart(time(14, 30)).special_points:
        assert point.formatted.endswith(point.sign.name), point.key


def test_houses_assigned_when_time_known():
    for point in _chart(time(14, 30)).special_points:
        assert point.house is not None and 1 <= point.house <= 12, point.key


def test_unknown_time_has_no_part_of_fortune_and_no_houses():
    chart = _chart(None)
    points = _by_key(chart.special_points)
    assert "part_of_fortune" not in points
    assert set(points) == {"south_node", "lilith", "juno"}
    assert all(p.house is None for p in chart.special_points)


def test_part_of_fortune_daytime_formula():
    chart = _chart(time(14, 30))
    planets = _by_key(chart.planets)
    sun, moon = planets["sun"], planets["moon"]
    assert sun.house >= 7  # öğleden sonra Güneş ufkun üstünde: gündüz haritası
    expected = (chart.ascendant.longitude + moon.longitude - sun.longitude) % 360.0
    fortune = _by_key(chart.special_points)["part_of_fortune"]
    assert fortune.longitude == pytest.approx(expected)


def test_part_of_fortune_nighttime_formula():
    chart = _chart(time(23, 30))
    planets = _by_key(chart.planets)
    sun, moon = planets["sun"], planets["moon"]
    assert sun.house < 7  # gece yarısına yakın Güneş ufkun altında: gece haritası
    expected = (chart.ascendant.longitude + sun.longitude - moon.longitude) % 360.0
    fortune = _by_key(chart.special_points)["part_of_fortune"]
    assert fortune.longitude == pytest.approx(expected)