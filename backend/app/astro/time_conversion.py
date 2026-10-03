"""Yerel doğum saatini UTC'ye çevirme.

Sabit offset (ör. "Türkiye = +3") KULLANILMAZ. IANA saat dilimi veritabanı
(zoneinfo) kullanılır; böylece geçmişteki yaz saati kuralları doğru uygulanır.
Örn. Europe/Istanbul 2016 öncesi kışın UTC+2, yazın UTC+3 idi.
"""

import logging
import threading
from dataclasses import dataclass
from datetime import date, datetime, time, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from timezonefinder import TimezoneFinder

from app.core.exceptions import InvalidInputError 

logger = logging.getLogger(__name__)


# TimezoneFinder'ın iş parçacığı güvenliği garanti edilmiyor; aramalar kilitle sırayla yapılır.
# Arama mikrosaniyeler sürdüğü için kilit performansı etkilemez.
_finder_lock = threading.Lock()


@lru_cache(maxsize=1)
def _get_finder() -> TimezoneFinder:
    """TimezoneFinder'ı ilk kullanımda bir kez oluşturur, sonra aynısını döndürür."""
    return TimezoneFinder()


def timezone_at(latitude: float, longitude: float) -> str:
    """Koordinattan IANA saat dilimi adını bulur, ör. (36.9, 30.7) -> "Europe/Istanbul".

    Saat dilimi kullanıcıdan alınmaz: koordinatla uyuşmayan bir saat dilimi
    hata vermeden yanlış harita üretirdi.
    """
    with _finder_lock:
        name = _get_finder().timezone_at(lng=longitude, lat=latitude)
    if name is None:
        raise InvalidInputError(
            "Bu konum için saat dilimi bulunamadı. Lütfen doğum yerini kontrol edin."
        )
    return name




@dataclass(frozen=True)
class UtcConversion:
    utc: datetime
    utc_offset_hours: float
    warnings: tuple[str, ...] = ()


def get_zone(tz_name: str) -> ZoneInfo:
    """IANA adından saat dilimi nesnesi üretir. Geçersizse kullanıcı dostu hata verir."""
    if not tz_name or not tz_name.strip():
        raise InvalidInputError("Saat dilimi boş olamaz.")
    try:
        return ZoneInfo(tz_name.strip())
    except (ZoneInfoNotFoundError, ValueError) as exc:
        logger.warning("Geçersiz saat dilimi: %r", tz_name)
        raise InvalidInputError(
            f"'{tz_name}' geçerli bir saat dilimi değil.", detail=str(exc)
        ) from exc


def local_to_utc(birth_date: date, birth_time: time, tz_name: str) -> UtcConversion:
    """Yerel tarih-saati UTC'ye çevirir.

    - Yaz saatine geçişte atlanan (hiç yaşanmamış) saat -> InvalidInputError
    - Geri alınışta iki kez yaşanan saat -> ilk geçiş (yaz saati) + uyarı
    """
    zone = get_zone(tz_name)
    naive = datetime.combine(birth_date, birth_time)

    # fold=0: belirsiz saatin ilk geçişi, fold=1: ikinci geçişi
    first = naive.replace(tzinfo=zone, fold=0)
    second = naive.replace(tzinfo=zone, fold=1)

    # Atlanan saat kontrolü: UTC'ye gidip geri dönünce aynı saat çıkmıyorsa
    # bu yerel saat o gün hiç yaşanmamıştır.
    round_trip = first.astimezone(timezone.utc).astimezone(zone).replace(tzinfo=None)
    if round_trip != naive:
        raise InvalidInputError(
            f"{naive:%d.%m.%Y %H:%M} saati bu bölgede yaz saati geçişi nedeniyle "
            "hiç yaşanmadı. Lütfen doğum saatini kontrol edin."
        )

    warnings: tuple[str, ...] = ()
    if first.utcoffset() != second.utcoffset():
        warnings = (
            f"{naive:%d.%m.%Y %H:%M} saati, saatlerin geri alınması nedeniyle iki kez "
            "yaşandı. İlk geçiş (yaz saati) esas alındı.",
        )

    offset = first.utcoffset()
    offset_hours = offset.total_seconds() / 3600 if offset is not None else 0.0

    return UtcConversion(
        utc=first.astimezone(timezone.utc),
        utc_offset_hours=offset_hours,
        warnings=warnings,
    ) 