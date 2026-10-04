"""time_conversion.py birim testleri."""

from datetime import date, datetime, time, timezone

import pytest

from app.astro.time_conversion import local_to_utc, timezone_at
from app.core.exceptions import InvalidInputError

ISTANBUL = "Europe/Istanbul"
BERLIN = "Europe/Berlin"


@pytest.mark.parametrize(
    ("birth_date", "expected_offset"),
    [
        (date(2010, 1, 15), 2),  # 2016 öncesi kış: UTC+2
        (date(2010, 7, 15), 3),  # 2016 öncesi yaz: UTC+3
        (date(2020, 1, 15), 3),  # 2016 sonrası: yıl boyu UTC+3
    ],
)
def test_istanbul_historical_offsets(birth_date, expected_offset):
    result = local_to_utc(birth_date, time(12, 0), ISTANBUL)
    assert result.utc_offset_hours == expected_offset


def test_converts_to_correct_utc_time():
    result = local_to_utc(date(2010, 1, 15), time(12, 0), ISTANBUL)
    assert result.utc == datetime(2010, 1, 15, 10, 0, tzinfo=timezone.utc)
    assert result.warnings == ()


def test_nonexistent_time_raises():
    # 28 Mart 2021, Berlin: saat 02:00'de doğrudan 03:00'e geçildi
    with pytest.raises(InvalidInputError):
        local_to_utc(date(2021, 3, 28), time(2, 30), BERLIN)


def test_ambiguous_time_uses_first_occurrence_and_warns():
    # 31 Ekim 2021, Berlin: 03:00'te saat 02:00'ye geri alındı, 02:30 iki kez yaşandı
    result = local_to_utc(date(2021, 10, 31), time(2, 30), BERLIN)
    assert result.utc_offset_hours == 2  # ilk geçiş = yaz saati (UTC+2)
    assert len(result.warnings) == 1


@pytest.mark.parametrize("tz_name", ["", "   ", "Mars/Olympus"])
def test_invalid_timezone_raises(tz_name):
    with pytest.raises(InvalidInputError):
        local_to_utc(date(2000, 1, 1), time(12, 0), tz_name)


@pytest.mark.parametrize(
    ("latitude", "longitude", "expected"),
    [
        (36.8969, 30.7133, "Europe/Istanbul"),  # Antalya
        (52.52, 13.40, "Europe/Berlin"),
        (40.71, -74.01, "America/New_York"),
    ],
)
def test_timezone_at(latitude, longitude, expected):
    assert timezone_at(latitude, longitude) == expected