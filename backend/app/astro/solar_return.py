"""Solar Return (Güneş dönüşü): Güneş'in doğum konumuna geri döndüğü an.

Güneş her yıl yaklaşık doğum gününde, doğum anındaki tam boylamına geri döner.
O anın haritası, doğum gününden bir sonrakine kadar süren yılın teması olarak yorumlanır.

Anı bulmak için Newton yöntemi kullanılır: Güneş'in hedefe olan uzaklığını
günlük hızına bölüp zamanı o kadar kaydırırız; birkaç adımda hedefe varılır.
"""

from datetime import datetime, timezone

from app.astro import ephemeris
from app.core.exceptions import CalculationError

# 1e-6 derece, Güneş için yaklaşık 0,1 saniyeye karşılık gelir
TOLERANCE_DEGREES = 1e-6
MAX_ITERATIONS = 25


def _start_guess(year: int, month: int, day: int) -> float:
    """Aranan yılda doğum gününün öğle vaktini başlangıç tahmini olarak verir."""
    try:
        guess = datetime(year, month, day, 12, tzinfo=timezone.utc)
    except ValueError:
        # 29 Şubat doğumlu biri için artık olmayan yıl: 28 Şubat'tan başlamak yeterli
        guess = datetime(year, month, 28, 12, tzinfo=timezone.utc)
    return ephemeris.julian_day(guess)


def find_solar_return(
    natal_sun_longitude: float, year: int, birth_month: int, birth_day: int
) -> float:
    """Verilen yılda Güneş'in doğum boylamına döndüğü anı (Jülyen gün) bulur."""
    jd = _start_guess(year, birth_month, birth_day)

    for _ in range(MAX_ITERATIONS):
        sun = ephemeris.calc_body(jd, "sun")
        # En kısa yöndeki fark, -180 ile +180 derece arasında (360° sınırını doğru geçer)
        difference = (natal_sun_longitude - sun.longitude + 180.0) % 360.0 - 180.0
        if abs(difference) < TOLERANCE_DEGREES:
            return jd
        jd += difference / sun.speed

    raise CalculationError(detail=f"Güneş dönüşü bulunamadı (yıl={year})")