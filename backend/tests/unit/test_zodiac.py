"""zodiac.py birim testleri."""

import pytest

from app.astro.zodiac import degree_in_sign, format_position, normalize, sign_of


@pytest.mark.parametrize(
    ("longitude", "expected"),
    [
        (0, "Koç"),
        (29.999, "Koç"),
        (30, "Boğa"),
        (359.9, "Balık"),
        (-10, "Balık"),  # negatif açı
        (720, "Koç"),  # 360'tan büyük açı
                (-1e-15, "Koç"),  # kayan nokta: -1e-15 % 360 == 360.0; çökmeden 0° (Koç) sayılmalı 
    ],
)
def test_sign_of(longitude, expected):
    assert sign_of(longitude).name == expected


def test_normalize():
    assert normalize(370) == 10
    assert normalize(-10) == 350


def test_degree_in_sign():
    assert degree_in_sign(123.5) == pytest.approx(3.5)


def test_format_position_basic():
    assert format_position(123.5) == "3°30' Aslan"


def test_format_position_truncates_and_stays_in_sign():
    # 59.9999° = Boğa 29°59.994' -> kesilince hâlâ Boğa olmalı (İkizler'e taşmamalı)
    assert format_position(59.9999) == "29°59' Boğa"
    assert sign_of(59.9999).name == "Boğa" 