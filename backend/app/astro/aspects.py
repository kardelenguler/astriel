"""Açılar (aspect): iki gök cismi arasındaki anlamlı açısal ilişkiler.

Saf Python: Swiss Ephemeris'e ihtiyaç duymaz; planets.py'nin sonucunu kullanır.
"""

from collections.abc import Sequence
from dataclasses import dataclass
from itertools import combinations

from app.astro.planets import PlanetPosition


@dataclass(frozen=True)
class AspectType:
    key: str  # frontend için sabit anahtar
    name: str  # Türkçe görünen ad
    angle: float  # tam açı (derece)
    orb: float  # tam açıdan izin verilen en fazla sapma


ASPECT_TYPES: tuple[AspectType, ...] = (
    AspectType("conjunction", "Kavuşum", 0, 8),
    AspectType("sextile", "Altmışlık", 60, 5),
    AspectType("square", "Kare", 90, 7),
    AspectType("trine", "Üçgen", 120, 8),
    AspectType("opposition", "Karşıt", 180, 8),
)


@dataclass(frozen=True)
class Aspect:
    first: str  # gezegen anahtarı, ör. "sun"
    second: str
    type: AspectType
    angle: float  # iki gezegen arasındaki gerçek açı (0–180)
    orb: float  # tam açıdan sapma
    applying: bool  # True: açı tamlaşıyor (uygulanan), False: dağılıyor veya tam


def angular_distance(a: float, b: float) -> float:
    """İki boylam arasındaki en kısa açı (0–180). Ör. 350° ile 10° arası 20°'dir."""
    difference = abs(a - b) % 360.0
    return 360.0 - difference if difference > 180.0 else difference


def _signed_separation(a: float, b: float) -> float:
    """b'nin a'ya göre işaretli açısı, (-180, 180] aralığında."""
    difference = (b - a) % 360.0
    return difference - 360.0 if difference > 180.0 else difference


def _sign(value: float) -> int:
    """Pozitifse 1, negatifse -1, sıfırsa 0."""
    return (value > 0) - (value < 0)


def _is_applying(p1: PlanetPosition, p2: PlanetPosition, exact_angle: float) -> bool:
    """Orb şu anda küçülüyorsa açı 'uygulanan'dır.

    İleri projeksiyon yerine türev kullanılır; böylece tam açıya ne kadar
    yakın olunursa olsun sonuç doğrudur (adım büyüklüğü yok, 'atlama' yok).
    """
    separation = _signed_separation(p1.longitude, p2.longitude)
    distance = abs(separation)

    # Mesafenin değişim hızı: işaretli açının hızı = hız farkı
    distance_rate = _sign(separation) * (p2.speed - p1.speed)

    # Orb = |mesafe - tam açı|; orb'un değişim hızı
    orb_rate = _sign(distance - exact_angle) * distance_rate

    return orb_rate < 0


def _closest_aspect_type(distance: float) -> AspectType | None:
    """Mesafeye orb içinde uyan en yakın açı türünü bulur; yoksa None."""
    matches = [t for t in ASPECT_TYPES if abs(distance - t.angle) <= t.orb]
    return min(matches, key=lambda t: abs(distance - t.angle), default=None)


def find_aspects(planets: Sequence[PlanetPosition]) -> tuple[Aspect, ...]:
    """Tüm gezegen çiftlerini karşılaştırır; en sıkı (orb'u en küçük) açı başta olur."""
    aspects: list[Aspect] = []

    for p1, p2 in combinations(planets, 2):
        distance = angular_distance(p1.longitude, p2.longitude)
        aspect_type = _closest_aspect_type(distance)
        if aspect_type is None:
            continue

        aspects.append(
            Aspect(
                first=p1.key,
                second=p2.key,
                type=aspect_type,
                angle=distance,
                orb=abs(distance - aspect_type.angle),
                applying=_is_applying(p1, p2, aspect_type.angle),
            )
        )

    return tuple(sorted(aspects, key=lambda a: a.orb)) 