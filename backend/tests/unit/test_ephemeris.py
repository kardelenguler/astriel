"""ephemeris.py birim testleri (gerçek Swiss Ephemeris hesaplamaları)."""

from datetime import datetime, timezone

import pytest

from app.astro.ephemeris import calc_body, calc_houses, julian_day

import threading


# 2000 ilkbahar ekinoksu: Güneş tam 0° Koç'a girer
EQUINOX_2000 = datetime(2000, 3, 20, 7, 35, tzinfo=timezone.utc)


def test_julian_day_rejects_naive_datetime():
    with pytest.raises(ValueError):
        julian_day(datetime(2000, 1, 1, 12, 0))


def test_sun_at_0_aries_on_equinox():
    sun = calc_body(julian_day(EQUINOX_2000), "sun")
    distance_to_0 = min(sun.longitude, 360 - sun.longitude)
    assert distance_to_0 < 0.01


def test_ephemeris_files_are_used():
    # Dosyalar ephemeris/ klasöründe değilse Moshier'e düşülür ve bu test başarısız olur
    assert calc_body(julian_day(EQUINOX_2000), "sun").from_file


def test_chiron_in_sagittarius_in_march_2000():
    chiron = calc_body(julian_day(EQUINOX_2000), "chiron")
    assert 240 <= chiron.longitude < 270  # Yay: 240°–270°


def test_placidus_houses_structure():
    houses = calc_houses(julian_day(EQUINOX_2000), 36.9, 30.7, "P")
    assert len(houses.cusps) == 12
    # Placidus'ta 1. ev = Yükselen, 10. ev = MC
    assert houses.cusps[0] == pytest.approx(houses.ascendant)
    assert houses.cusps[9] == pytest.approx(houses.midheaven)





def test_ephemeris_files_are_used_in_other_threads():
    # FastAPI 'def' route'larını ayrı iş parçacıklarında çalıştırır;
    # Swiss Ephemeris ayarları iş parçacığına özel olduğu için bunu ayrıca test ediyoruz.
    results = {}

    def worker():
        jd = julian_day(EQUINOX_2000)
        results["sun_from_file"] = calc_body(jd, "sun").from_file
        results["chiron"] = calc_body(jd, "chiron").longitude

    thread = threading.Thread(target=worker)
    thread.start()
    thread.join()

    assert results["sun_from_file"]
    assert 240 <= results["chiron"] < 270