"""İkincil ilerletme (secondary progression): "bir gün = bir yıl".

Doğumdan sonraki her gün, hayatın bir yılını temsil eder. 30 yaşındaki birinin
ilerletilmiş haritası, doğumundan 30 gün sonraki gökyüzüyle çizilir.
Bir yıl, tropikal yıl uzunluğu (365,2422 gün) olarak alınır.
"""

import math

from app.astro import ephemeris
from app.core.exceptions import CalculationError

TROPICAL_YEAR_DAYS = 365.2421897

# 1e-6 derece, Ay için yaklaşık 0,1 saniyeye karşılık gelir
TOLERANCE_DEGREES = 1e-6
MAX_ITERATIONS = 25


def next_moon_sign_change(jd: float) -> float:
    """Verilen andan sonra Ay'ın bir sonraki burç sınırını geçtiği anı (Jülyen gün) bulur.

    Ay hiçbir zaman retro olmaz (günde yaklaşık 12–15°), bu yüzden sınıra hep ileri gidilir.
    Newton yöntemi: kalan mesafeyi güncel hıza bölüp zamanı o kadar kaydırırız.
    """
    moon = ephemeris.calc_body(jd, "moon")
    boundary = (math.floor(moon.longitude / 30) + 1) * 30 % 360
    cross = jd + ((boundary - moon.longitude) % 360) / moon.speed

    for _ in range(MAX_ITERATIONS):
        current = ephemeris.calc_body(cross, "moon")
        # En kısa yöndeki fark, -180 ile +180 derece arasında (360° sınırını doğru geçer)
        difference = (boundary - current.longitude + 180.0) % 360.0 - 180.0
        if abs(difference) < TOLERANCE_DEGREES:
            return cross
        cross += difference / current.speed

    raise CalculationError(detail="Ay'ın burç geçişi bulunamadı")