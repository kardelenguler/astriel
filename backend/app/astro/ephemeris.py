"""Swiss Ephemeris ile konuşan TEK dosya.

Projenin geri kalanı `swisseph`'i doğrudan import etmez; buradaki fonksiyonları
kullanır. Kütüphane ya da dönüş biçimi değişirse (pyswisseph -> pysweph geçişinde
olduğu gibi) sadece bu dosya değişir.

pysweph dönüş biçimleri:
    calc_ut   -> (konum_6_değer, bayrak, hata_mesajı)
    houses_ex -> (13 elemanlı evler [0. eleman boş], 8 elemanlı özel noktalar)
"""

import logging
import threading
from dataclasses import dataclass
from datetime import datetime, timezone

import swisseph as swe

from app.core.config import settings
from app.core.exceptions import CalculationError 


logger = logging.getLogger(__name__)

# Swiss Ephemeris ayarları iş parçacığına (thread) özeldir. FastAPI 'def' route'larını
# ayrı iş parçacıklarında çalıştırdığı için klasör yolu her iş parçacığında bir kez ayarlanır.
_thread_state = threading.local()


def _ensure_ephe_path() -> None:
    if not getattr(_thread_state, "ephe_path_set", False):
        swe.set_ephe_path(str(settings.ephe_dir))
        _thread_state.ephe_path_set = True 

EPHEMERIS_VERSION: str = swe.version

# sepl_18 / semo_18 / seas_18 dosyaları kabaca 1800–2400 arasını kapsar.
# Sınırlar birer yıl içeriden başlar: yerel tarih UTC'ye çevrilince (ve saat bilinmiyorsa
# ±12 saat Ay kontrolü yapılınca) bir gün kayabilir. Ör. Antalya 01.01.1800 00:30 -> UTC 1799;
# o tarih için seas_12.se1 gerekir ve Chiron hesaplanamaz (test_supported_year_boundaries).
MIN_YEAR = 1801
MAX_YEAR = 2398 

# Dışarıya sade anahtarlar açılır; Swiss Ephemeris sabitleri bu dosyada kalır.
BODY_IDS: dict[str, int] = {
    "sun": swe.SUN,
    "moon": swe.MOON,
    "mercury": swe.MERCURY,
    "venus": swe.VENUS,
    "mars": swe.MARS,
    "jupiter": swe.JUPITER,
    "saturn": swe.SATURN,
    "uranus": swe.URANUS,
    "neptune": swe.NEPTUNE,
    "pluto": swe.PLUTO,
    "north_node": swe.TRUE_NODE,
    "chiron": swe.CHIRON,
}


@dataclass(frozen=True)
class RawBodyPosition:
    longitude: float  # ekliptik boylam, 0–360°
    latitude: float  # ekliptik enlem
    speed: float  # günlük hız (derece/gün); negatifse gezegen retro
    from_file: bool  # True: efemeris dosyası, False: Moshier yedek modeli


@dataclass(frozen=True)
class RawHouses:
    cusps: tuple[float, ...]  # 12 ev başlangıcı; cusps[0] = 1. ev
    ascendant: float
    midheaven: float


def julian_day(moment: datetime) -> float:
    """Saat dilimi bilgili bir datetime'ı Jülyen gününe çevirir."""
    if moment.tzinfo is None:
        # Kullanıcı hatası değil, programlama hatası: her zaman UTC'li zaman verilmeli
        raise ValueError("julian_day() saat dilimi bilgisi olan bir datetime bekler.")
    utc = moment.astimezone(timezone.utc)
    hour = utc.hour + utc.minute / 60 + utc.second / 3600 + utc.microsecond / 3_600_000_000
    return swe.julday(utc.year, utc.month, utc.day, hour, swe.GREG_CAL)


def calc_body(jd: float, body_key: str) -> RawBodyPosition:
    """Bir gök cisminin konumunu hesaplar."""
    _ensure_ephe_path()  
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    try:
        values, return_flag, message = swe.calc_ut(jd, BODY_IDS[body_key], flags)
    except swe.Error as exc:
        raise CalculationError(detail=f"{body_key}: {exc}") from exc

    if message:
        logger.warning("Swiss Ephemeris uyarısı (%s): %s", body_key, message)

    return RawBodyPosition(
        longitude=values[0],
        latitude=values[1],
        speed=values[3],
        from_file=bool(return_flag & swe.FLG_SWIEPH),
    )


def calc_houses(jd: float, latitude: float, longitude: float, system: str) -> RawHouses:
    """Ev başlangıçlarını, yükseleni ve MC'yi hesaplar.

    system: tek harfli ev sistemi kodu, ör. "P" (Placidus), "W" (Whole Sign)
    """
    _ensure_ephe_path()
    try:
        cusps, points = swe.houses_ex(jd, latitude, longitude, system.encode("ascii"))
    except swe.Error as exc:
        raise CalculationError(detail=f"houses({system}): {exc}") from exc

    # pysweph 13 eleman döndürür ve 0. eleman boştur; farklı sürümlere karşı iki durumu da ele al
    twelve = cusps[1:13] if len(cusps) == 13 else cusps[:12]

    return RawHouses(cusps=tuple(twelve), ascendant=points[0], midheaven=points[1]) 