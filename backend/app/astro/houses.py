"""Evler, yükselen (ASC) ve tepe noktası (MC).

Ham hesaplama ephemeris.py'de yapılır; bu dosya sonucu burç bilgisiyle
zenginleştirir ve ev sistemiyle ilgili kuralları uygular.
"""

from collections.abc import Sequence
from dataclasses import dataclass

from app.astro import ephemeris
from app.astro.zodiac import Sign, format_position, normalize, sign_of
from app.core.exceptions import InvalidInputError

HOUSE_SYSTEMS: dict[str, str] = {
    "P": "Placidus",
    "K": "Koch",
    "W": "Whole Sign",
    "E": "Equal",
    "O": "Porphyry",
    "R": "Regiomontanus",
}
DEFAULT_HOUSE_SYSTEM = "P"

# Placidus ve Koch, kutup dairesine yakın enlemlerde matematiksel olarak tanımsızdır
POLAR_LATITUDE_LIMIT = 66.0
POLAR_UNSAFE_SYSTEMS = frozenset({"P", "K"})
POLAR_FALLBACK_SYSTEM = "W"


@dataclass(frozen=True)
class ChartPoint:
    """Haritadaki bir nokta: ev başlangıcı, yükselen veya MC."""

    longitude: float
    sign: Sign
    formatted: str  # ör. "11°57' İkizler"

    @classmethod
    def from_longitude(cls, longitude: float) -> "ChartPoint":
        return cls(longitude=longitude, sign=sign_of(longitude), formatted=format_position(longitude))


@dataclass(frozen=True)
class HouseResult:
    system_code: str  # gerçekte kullanılan sistem (kutup yedeği sonrası)
    system_name: str
    cusps: tuple[ChartPoint, ...]  # 12 ev; cusps[0] = 1. ev
    ascendant: ChartPoint
    midheaven: ChartPoint
    warnings: tuple[str, ...] = ()

    @property
    def cusp_longitudes(self) -> tuple[float, ...]:
        return tuple(cusp.longitude for cusp in self.cusps)


def calculate_houses(jd: float, latitude: float, longitude: float, system: str) -> HouseResult:
    if system not in HOUSE_SYSTEMS:
        raise InvalidInputError(
            f"Desteklenmeyen ev sistemi: '{system}'. "
            f"Seçenekler: {', '.join(HOUSE_SYSTEMS)}"
        )

    warnings: tuple[str, ...] = ()
    if abs(latitude) >= POLAR_LATITUDE_LIMIT and system in POLAR_UNSAFE_SYSTEMS:
        warnings = (
            f"{HOUSE_SYSTEMS[system]} ev sistemi {POLAR_LATITUDE_LIMIT:.0f}° enlemin "
            f"üzerinde hesaplanamaz; {HOUSE_SYSTEMS[POLAR_FALLBACK_SYSTEM]} kullanıldı.",
        )
        system = POLAR_FALLBACK_SYSTEM

    raw = ephemeris.calc_houses(jd, latitude, longitude, system)

    return HouseResult(
        system_code=system,
        system_name=HOUSE_SYSTEMS[system],
        cusps=tuple(ChartPoint.from_longitude(c) for c in raw.cusps),
        ascendant=ChartPoint.from_longitude(raw.ascendant),
        midheaven=ChartPoint.from_longitude(raw.midheaven),
        warnings=warnings,
    )


def house_of(longitude: float, cusps: Sequence[float]) -> int:
    """Bir boylamın hangi evde olduğunu bulur (1–12).

    Evler 0°/360° sınırını geçebilir (ör. 1. ev 350°'den 20°'ye kadar).
    Bu yüzden her ev aralığı ve boylam, ev başlangıcına göre mod 360 ile ölçülür.
    """
    if len(cusps) != 12:
        raise ValueError("house_of() tam 12 ev başlangıcı bekler.")

    target = normalize(longitude)
    for index in range(12):
        start = normalize(cusps[index])
        end = normalize(cusps[(index + 1) % 12])
        house_width = (end - start) % 360.0
        distance_from_start = (target - start) % 360.0
        if distance_from_start < house_width:
            return index + 1

    return 1  # sayısal kenar durumu: tam sınırda kalırsa 1. ev