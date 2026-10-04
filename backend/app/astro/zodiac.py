"""Burçlar ve derece yardımcıları.

Saf Python: Swiss Ephemeris'i, veritabanını veya FastAPI'yi bilmez.

Ekliptik boylam 0°–360° arasıdır ve her burç 30° kaplar:
    0° = Koç başlangıcı, 30° = Boğa başlangıcı, ..., 330° = Balık başlangıcı
"""

from dataclasses import dataclass
from typing import Literal

Element = Literal["fire", "earth", "air", "water"]
Modality = Literal["cardinal", "fixed", "mutable"]

DEGREES_PER_SIGN = 30.0


@dataclass(frozen=True)
class Sign:
    key: str  # frontend için sabit anahtar (ikon dosyası, çeviri), ör. "aries"
    name: str  # kullanıcıya gösterilen Türkçe ad
    element: Element
    modality: Modality


SIGNS: tuple[Sign, ...] = (
    Sign("aries", "Koç", "fire", "cardinal"),
    Sign("taurus", "Boğa", "earth", "fixed"),
    Sign("gemini", "İkizler", "air", "mutable"),
    Sign("cancer", "Yengeç", "water", "cardinal"),
    Sign("leo", "Aslan", "fire", "fixed"),
    Sign("virgo", "Başak", "earth", "mutable"),
    Sign("libra", "Terazi", "air", "cardinal"),
    Sign("scorpio", "Akrep", "water", "fixed"),
    Sign("sagittarius", "Yay", "fire", "mutable"),
    Sign("capricorn", "Oğlak", "earth", "cardinal"),
    Sign("aquarius", "Kova", "air", "fixed"),
    Sign("pisces", "Balık", "water", "mutable"),
)


def normalize(longitude: float) -> float:
    """Açıyı [0, 360) aralığına getirir. Ör. -10 -> 350, 370 -> 10."""
    return longitude % 360.0


def sign_of(longitude: float) -> Sign:
    """Boylamın düştüğü burcu döndürür."""
    # Sondaki '% 12' kayan nokta kenar durumu için:
    # Python'da (-1e-15) % 360 == 360.0 çıkar; bu da 12. indeksi, yani IndexError'ı verirdi.
    index = int(normalize(longitude) // DEGREES_PER_SIGN) % 12
    return SIGNS[index]


def degree_in_sign(longitude: float) -> float:
    """Burç içindeki derece (0–30). Ör. 123.5 -> 3.5 (Aslan'ın 3.5°'si)."""
    return normalize(longitude) % DEGREES_PER_SIGN


def format_position(longitude: float) -> str:
    """Boylamı okunur biçime çevirir. Ör. 123.5 -> "3°30' Aslan".

    Dakikalar yuvarlanmaz, KESİLİR (astrolojideki geleneksel gösterim).
    Böylece 29°59.9' değeri "29°59'" olarak yazılır ve sign_of() ile
    her zaman aynı burcu gösterir; bir sonraki burca taşmaz.
    """
    total_minutes = int(normalize(longitude) * 60) % (360 * 60)
    sign = SIGNS[total_minutes // (30 * 60)]
    minutes_in_sign = total_minutes % (30 * 60)
    degrees, minutes = divmod(minutes_in_sign, 60)
    return f"{degrees}°{minutes:02d}' {sign.name}"