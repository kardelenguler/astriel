"""Özel noktalar: Güney Ay Düğümü, Lilit, Juno ve Şans Noktası.

Kuzey Ay Düğümü ve Chiron zaten planets.py içinde hesaplanır; burada tekrarlanmaz.
Bu noktalar açı (aspect) hesabına katılmaz, ayrı bir liste olarak döner.
"""

import logging
from collections.abc import Sequence
from dataclasses import dataclass

from app.astro import ephemeris
from app.astro.houses import HouseResult, house_of
from app.astro.planets import PlanetPosition
from app.astro.zodiac import Sign, degree_in_sign, format_position, normalize, sign_of
from app.core.exceptions import CalculationError

logger = logging.getLogger(__name__)

# Gündüz/gece ayrımı: Güneş ufkun üstündeyse (7.–12. evler) doğum gündüzdür
FIRST_DAYTIME_HOUSE = 7


@dataclass(frozen=True)
class SpecialPoint:
    key: str
    name: str
    longitude: float
    sign: Sign
    degree: float  # burç içindeki derece, 0–30
    formatted: str  # ör. "3°30' Aslan"
    house: int | None  # doğum saati bilinmiyorsa None


@dataclass(frozen=True)
class SpecialPointsResult:
    points: tuple[SpecialPoint, ...]
    warnings: tuple[str, ...] = ()


def _make_point(
    key: str, name: str, longitude: float, cusps: Sequence[float] | None
) -> SpecialPoint:
    longitude = normalize(longitude)
    return SpecialPoint(
        key=key,
        name=name,
        longitude=longitude,
        sign=sign_of(longitude),
        degree=degree_in_sign(longitude),
        formatted=format_position(longitude),
        house=house_of(longitude, cusps) if cusps else None,
    )


def _part_of_fortune(
    ascendant: float, sun: PlanetPosition, moon: PlanetPosition
) -> float:
    """Şans Noktası: gündüz Yükselen + Ay - Güneş, gece Yükselen + Güneş - Ay."""
    is_daytime = sun.house is not None and sun.house >= FIRST_DAYTIME_HOUSE
    if is_daytime:
        return normalize(ascendant + moon.longitude - sun.longitude)
    return normalize(ascendant + sun.longitude - moon.longitude)


def calculate_special_points(
    jd: float,
    planets: Sequence[PlanetPosition],
    houses: HouseResult | None,
) -> SpecialPointsResult:
    """Özel noktaları hesaplar.

    houses: doğum saati bilinmiyorsa None. O zaman evler atanmaz ve
    Şans Noktası hesaplanmaz (yükselen gerekir).
    """
    by_key = {planet.key: planet for planet in planets}
    cusps = houses.cusp_longitudes if houses else None
    points: list[SpecialPoint] = []
    warnings: list[str] = []

    # ---------- Güney Ay Düğümü: Kuzey Düğüm'ün tam karşısı ----------
    north_node = by_key.get("north_node")
    if north_node is not None:
        points.append(
            _make_point("south_node", "Güney Ay Düğümü", north_node.longitude + 180.0, cusps)
        )

    # ---------- Lilit (ortalama Ay apojesi) ----------
    try:
        lilith = ephemeris.calc_body(jd, "lilith")
        points.append(_make_point("lilith", "Lilit", lilith.longitude, cusps))
    except CalculationError:
        logger.warning("Lilit hesaplanamadı, atlanıyor.", exc_info=True)
        warnings.append("Lilit hesaplanamadı ve haritada gösterilmiyor.")

    # ---------- Juno (asteroid dosyası gerekir) ----------
    try:
        juno = ephemeris.calc_body(jd, "juno")
        points.append(_make_point("juno", "Juno", juno.longitude, cusps))
    except CalculationError:
        logger.warning("Juno hesaplanamadı, atlanıyor.", exc_info=True)
        warnings.append("Juno hesaplanamadı ve haritada gösterilmiyor.")

    # ---------- Şans Noktası (sadece doğum saati biliniyorsa) ----------
    sun = by_key.get("sun")
    moon = by_key.get("moon")
    if houses is not None and sun is not None and moon is not None:
        fortune = _part_of_fortune(houses.ascendant.longitude, sun, moon)
        points.append(_make_point("part_of_fortune", "Şans Noktası", fortune, cusps))

    return SpecialPointsResult(points=tuple(points), warnings=tuple(warnings))