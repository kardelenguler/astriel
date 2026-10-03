"""Harita iş mantığı.

calculate(): astro motorunun parçalarını doğru sırayla çağırıp tek bir harita üretir.
Kayıtlı haritalarla ilgili işlemler (kaydet, listele, sil) kullanıcı sistemi
eklendiğinde bu sınıfa eklenecek.
"""

import logging
from datetime import datetime, time, timedelta

from app.astro import ephemeris
from app.astro.aspects import find_aspects
from app.astro.houses import calculate_houses
from app.astro.planets import calculate_planets
from app.astro.time_conversion import local_to_utc, timezone_at
from app.astro.zodiac import sign_of
from app.schemas.chart import (
    AspectOut,
    ChartCalculateRequest,
    ChartResponse,
    HouseSystemOut,
    PlanetOut,
    PointOut,
)

logger = logging.getLogger(__name__)

# Hesaplama kuralları değişirse ilk kısmı artır; kayıtlı haritaların hangi sürümle
# hesaplandığı birth_charts.engine_version sütununda tutulur.
ENGINE_VERSION = f"astriel-1/swe-{ephemeris.EPHEMERIS_VERSION}"

# Doğum saati bilinmiyorsa gezegenler öğle vaktine göre hesaplanır:
# gün içindeki en büyük olası hata böylece en küçük olur (±12 saat).
UNKNOWN_TIME_DEFAULT = time(12, 0)


class ChartService:
    def calculate(self, request: ChartCalculateRequest) -> ChartResponse:
        time_known = request.birth_time is not None
        local_time = request.birth_time or UNKNOWN_TIME_DEFAULT

        # Saat dilimi kullanıcıdan alınmaz; koordinattan bulunur (uyuşmazlık imkânsız olsun)
        tz_name = timezone_at(request.latitude, request.longitude)
        conversion = local_to_utc(request.birth_date, local_time, tz_name)
        jd = ephemeris.julian_day(conversion.utc)
        warnings: list[str] = list(conversion.warnings)

        # ---------- Evler (sadece saat biliniyorsa) ----------
        houses = None
        if time_known:
            houses = calculate_houses(
                jd, request.latitude, request.longitude, request.house_system
            )
            warnings.extend(houses.warnings)
        else:
            warnings.append(
                "Doğum saati bilinmediği için yükselen burç ve evler hesaplanmadı; "
                "gezegenler öğle saatine göre gösteriliyor."
            )
            moon_warning = self._moon_sign_change_warning(conversion.utc)
            if moon_warning:
                warnings.append(moon_warning)

        # ---------- Gezegenler ve açılar ----------
        planets = calculate_planets(jd, houses.cusp_longitudes if houses else None)
        warnings.extend(planets.warnings)
        aspects = find_aspects(planets.planets)

        # Doğum tarihi kişisel veridir; log'a yazılmaz.
        logger.info(
            "Harita hesaplandı: saat_biliniyor=%s, uyarı=%d",
            time_known, len(warnings),
        ) 

        return ChartResponse(
            utc_datetime=conversion.utc,
            utc_offset_hours=conversion.utc_offset_hours,
            timezone=tz_name,
            time_known=time_known,
            house_system=(
                HouseSystemOut(code=houses.system_code, name=houses.system_name)
                if houses else None
            ),
            ascendant=PointOut.model_validate(houses.ascendant) if houses else None,
            midheaven=PointOut.model_validate(houses.midheaven) if houses else None,
            houses=[PointOut.model_validate(c) for c in houses.cusps] if houses else [],
            planets=[PlanetOut.model_validate(p) for p in planets.planets],
            aspects=[AspectOut.model_validate(a) for a in aspects],
            warnings=warnings,
            engine_version=ENGINE_VERSION,
        )

    @staticmethod
    def _moon_sign_change_warning(local_noon_utc: datetime) -> str | None:
        """Ay, doğum gününde burç değiştiriyorsa uyarı metni döndürür.

        Ay yaklaşık 2,5 günde bir burç değiştirir; saat bilinmeden hangi
        burçta olduğu kesin olmayabilir. Günün başı ve sonu, yerel öğlenin
        12 saat öncesi ve sonrası olarak alınır (gece yarısı yaz saati
        geçişine denk gelse bile hata vermez).
        """
        start = local_noon_utc - timedelta(hours=12)
        end = local_noon_utc + timedelta(hours=12)
        sign_at_start = sign_of(ephemeris.calc_body(ephemeris.julian_day(start), "moon").longitude)
        sign_at_end = sign_of(ephemeris.calc_body(ephemeris.julian_day(end), "moon").longitude)

        if sign_at_start == sign_at_end:
            return None
        return (
            f"Ay bu gün {sign_at_start.name} burcundan {sign_at_end.name} burcuna geçiyor; "
            "doğum saati olmadan Ay burcu kesin değil."
        ) 