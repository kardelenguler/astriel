"""Yer arama API'sinin yanıt modeli (Pydantic)."""

from pydantic import BaseModel, ConfigDict


class PlaceOut(BaseModel):
    """Bir arama sonucu. Kullanıcı birini seçince enlem/boylam forma yazılır."""

    model_config = ConfigDict(from_attributes=True)  # geocoder'ın Place dataclass'ından oluşur

    name: str  # "Antalya"
    display_name: str  # "Antalya, Akdeniz Bölgesi, Türkiye" (listede gösterilir)
    latitude: float
    longitude: float
    country: str | None