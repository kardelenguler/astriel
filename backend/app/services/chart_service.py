"""Harita iş mantığı.

calculate(): astro motorunun parçalarını doğru sırayla çağırıp tek bir harita üretir.
solar_return(): Güneş dönüşü anını bulur ve o an için aynı hesabı yapar.
Kayıtlı haritalarla ilgili işlemler (kaydet, listele, sil) SavedChartService'tedir.
"""

import logging
from datetime import datetime, time, timedelta

from app.astro import ephemeris
from app.astro.aspects import find_aspects
from app.astro.houses import calculate_houses
from app.astro.planets import calculate_planets
from app.astro.solar_return import find_solar_return
from app.astro.special_points import calculate_special_points
from app.astro.time_conversion import get_zone, local_to_utc, timezone_at
from app.astro.zodiac import sign_of
from app.schemas.chart import (
    AspectOut,
    ChartCalculateRequest,
    ChartResponse,
    HouseSystemOut,
    PlanetOut,
    PointOut,
    SolarReturnRequest,
    SolarReturnResponse,
    SpecialPointOut,
)

logger = logging.getLogger(__name__)

# Hesaplama kuralları değişirse ilk kısmı artır; kayıtlı haritaların hangi sürümle
# hesaplandığı birth_charts.engine_version sütununda tutulur.
# astriel-2: özel noktalar (Güney Düğüm, Lilit, Juno, Şans Noktası) eklendi.
# astriel-3: "Kuzey Ay Düğümü" -> "Kuzey Düğüm", "Chiron" -> "Kiron" olarak yeniden adlandırıldı.
ENGINE_VERSION = f"astriel-3/swe-{ephemeris.EPHEMERIS_VERSION}"

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

        return self._chart_at(
            utc=conversion.utc,
            utc_offset_hours=conversion.utc_offset_hours,
            tz_name=tz_name,
            latitude=request.latitude,
            longitude=request.longitude,
            house_system=request.house_system,
            time_known=time_known,
            warnings=list(conversion.warnings),
        )

    def solar_return(self, request: SolarReturnRequest) -> SolarReturnResponse:
        """Verilen yılın Güneş dönüşü haritası (doğum yerine ya da bulunulan yere göre)."""
        time_known = request.birth_time is not None
        local_time = request.birth_time or UNKNOWN_TIME_DEFAULT

        # Doğumdaki Güneş boylamı: Güneş dönüşünün hedefi
        birth_tz = timezone_at(request.latitude, request.longitude)
        birth = local_to_utc(request.birth_date, local_time, birth_tz)
        natal_sun = ephemeris.calc_body(ephemeris.julian_day(birth.utc), "sun").longitude

        jd = find_solar_return(
            natal_sun, request.year, request.birth_date.month, request.birth_date.day
        )
        moment = ephemeris.utc_from_julian_day(jd)

        # Harita hangi yere göre çıkarılacak: bulunulan yer verilmişse o, yoksa doğum yeri
        used_birth_place = request.return_latitude is None
        latitude = request.latitude if request.return_latitude is None else request.return_latitude
        longitude = (
            request.longitude if request.return_longitude is None else request.return_longitude
        )
        return_tz = timezone_at(latitude, longitude)
        offset = moment.astimezone(get_zone(return_tz)).utcoffset()
        offset_hours = offset.total_seconds() / 3600 if offset is not None else 0.0

        warnings = list(birth.warnings)
        if not time_known:
            warnings.append(
                "Doğum saati bilinmediği için Güneş dönüşü anı yaklaşık hesaplandı; "
                "gerçek an birkaç saat kayabilir."
            )

        # Güneş dönüşünün anı kesin olduğundan, bu harita için saat "biliniyor" sayılır
        chart = self._chart_at(
            utc=moment,
            utc_offset_hours=offset_hours,
            tz_name=return_tz,
            latitude=latitude,
            longitude=longitude,
            house_system=request.house_system,
            time_known=True,
            warnings=warnings,
        )
        return SolarReturnResponse(
            year=request.year, used_birth_place=used_birth_place, chart=chart
        )

    def _chart_at(
        self,
        *,
        utc: datetime,
        utc_offset_hours: float,
        tz_name: str,
        latitude: float,
        longitude: float,
        house_system: str,
        time_known: bool,
        warnings: list[str],
    ) -> ChartResponse:
        """Belirli bir an ve yer için haritayı üretir (doğum haritası ve Solar Return ortak kullanır)."""
        jd = ephemeris.julian_day(utc)

        # ---------- Evler (sadece saat biliniyorsa) ----------
        houses = None
        if time_known:
            houses = calculate_houses(jd, latitude, longitude, house_system)
            warnings.extend(houses.warnings)
        else:
            warnings.append(
                "Doğum saati bilinmediği için yükselen burç ve evler hesaplanmadı; "
                "gezegenler öğle saatine göre gösteriliyor."
            )
            moon_warning = self._moon_sign_change_warning(utc)
            if moon_warning:
                warnings.append(moon_warning)

        # ---------- Gezegenler ve açılar ----------
        planets = calculate_planets(jd, houses.cusp_longitudes if houses else None)
        warnings.extend(planets.warnings)
        aspects = find_aspects(planets.planets)

        # ---------- Özel noktalar (Güney Düğüm, Lilit, Juno, Şans Noktası) ----------
        special = calculate_special_points(jd, planets.planets, houses)
        warnings.extend(special.warnings)

        # Doğum tarihi kişisel veridir; log'a yazılmaz.
        logger.info(
            "Harita hesaplandı: saat_biliniyor=%s, uyarı=%d",
            time_known, len(warnings),
        )

        return ChartResponse(
            utc_datetime=utc,
            utc_offset_hours=utc_offset_hours,
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
            special_points=[SpecialPointOut.model_validate(p) for p in special.points],
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