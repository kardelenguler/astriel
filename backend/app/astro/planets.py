"""Gezegen konumları.

ephemeris.py'den ham konumları alır; burç, derece, retro ve ev bilgisi ekler.
"""

import logging
from collections.abc import Sequence
from dataclasses import dataclass

from app.astro import ephemeris
from app.astro.houses import house_of
from app.astro.zodiac import Sign, degree_in_sign, format_position, sign_of
from app.core.exceptions import CalculationError

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class BodyInfo:
    """Hesaplanacak bir gök cisminin sabit bilgileri."""

    key: str  # ephemeris.BODY_IDS'teki anahtar
    name: str  # Türkçe görünen ad
    optional: bool = False  # hesaplanamazsa harita yine de üretilir
    can_be_retrograde: bool = True


BODIES: tuple[BodyInfo, ...] = (
    BodyInfo("sun", "Güneş", can_be_retrograde=False),
    BodyInfo("moon", "Ay", can_be_retrograde=False),
    BodyInfo("mercury", "Merkür"),
    BodyInfo("venus", "Venüs"),
    BodyInfo("mars", "Mars"),
    BodyInfo("jupiter", "Jüpiter"),
    BodyInfo("saturn", "Satürn"),
    BodyInfo("uranus", "Uranüs"),
    BodyInfo("neptune", "Neptün"),
    BodyInfo("pluto", "Plüton"),
    # Ay düğümü neredeyse hep geri gider; "retro" etiketi anlamsız olduğundan gösterilmez
    BodyInfo("north_node", "Kuzey Ay Düğümü", can_be_retrograde=False),
    # Chiron sadece seas_18.se1 dosyası varsa hesaplanabilir
    BodyInfo("chiron", "Chiron", optional=True),
)


@dataclass(frozen=True)
class PlanetPosition:
    key: str
    name: str
    longitude: float
    sign: Sign
    degree: float  # burç içindeki derece, 0–30
    formatted: str  # ör. "3°30' Aslan"
    speed: float  # derece/gün
    retrograde: bool
    house: int | None  # doğum saati bilinmiyorsa None


@dataclass(frozen=True)
class PlanetsResult:
    planets: tuple[PlanetPosition, ...]
    used_fallback_model: bool  # True: efemeris dosyası yok, Moshier kullanıldı
    warnings: tuple[str, ...] = ()


def calculate_planets(jd: float, cusps: Sequence[float] | None = None) -> PlanetsResult:
    """Tüm gök cisimlerini hesaplar.

    cusps: 12 ev başlangıcı. Verilmezse (doğum saati bilinmiyorsa) ev atanmaz.
    """
    planets: list[PlanetPosition] = []
    warnings: list[str] = []
    used_fallback = False

    for body in BODIES:
        try:
            raw = ephemeris.calc_body(jd, body.key)
        except CalculationError:
            if not body.optional:
                raise
            logger.warning("%s hesaplanamadı, atlanıyor.", body.name, exc_info=True)
            warnings.append(f"{body.name} hesaplanamadı ve haritada gösterilmiyor.")
            continue

        used_fallback = used_fallback or not raw.from_file
        planets.append(
            PlanetPosition(
                key=body.key,
                name=body.name,
                longitude=raw.longitude,
                sign=sign_of(raw.longitude),
                degree=degree_in_sign(raw.longitude),
                formatted=format_position(raw.longitude),
                speed=raw.speed,
                retrograde=body.can_be_retrograde and raw.speed < 0,
                house=house_of(raw.longitude, cusps) if cusps else None,
            )
        )

    if used_fallback:
        warnings.append(
            "Efemeris dosyaları bulunamadı; daha düşük hassasiyetli yedek model kullanıldı."
        )

    return PlanetsResult(
        planets=tuple(planets),
        used_fallback_model=used_fallback,
        warnings=tuple(warnings),
    ) 