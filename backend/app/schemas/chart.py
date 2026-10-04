"""Harita API'sinin istek ve yanıt modelleri (Pydantic).

- İstek modelleri kullanıcıdan gelen veriyi DOĞRULAR (ilk savunma hattı).
- Yanıt modelleri frontend'e giden JSON'un biçimini TANIMLAR.
  Angular'daki TypeScript interface'leri bu modellerin birebir karşılığıdır.
"""

import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.astro.ephemeris import MAX_YEAR, MIN_YEAR
from app.astro.houses import DEFAULT_HOUSE_SYSTEM, HOUSE_SYSTEMS


# =============================== İSTEK ===============================
class ChartCalculateRequest(BaseModel):
    """Harita hesaplamak için gereken doğum bilgileri."""

    model_config = ConfigDict(str_strip_whitespace=True)  # metinlerin başındaki/sonundaki boşlukları sil

    birth_date: date = Field(examples=["1995-06-15"])
    birth_time: time | None = Field(
        default=None,
        description="Doğum saati bilinmiyorsa boş bırakılır; yükselen ve evler hesaplanmaz.",
        examples=["14:30"],
    )
    latitude: float = Field(ge=-90, le=90, examples=[36.8969])
    longitude: float = Field(ge=-180, le=180, examples=[30.7133])
    house_system: str = Field(default=DEFAULT_HOUSE_SYSTEM, examples=["P"])

    @field_validator("birth_date")
    @classmethod
    def year_must_be_supported(cls, value: date) -> date:
        if not MIN_YEAR <= value.year <= MAX_YEAR:
            raise ValueError(f"Doğum yılı {MIN_YEAR}–{MAX_YEAR} arasında olmalıdır.")
        return value

    @field_validator("birth_time")
    @classmethod
    def birth_time_must_be_local(cls, value: time | None) -> time | None:
        # "14:30Z" veya "14:30+03:00" gibi saat dilimli değerler reddedilir.
        # Saat dilimi koordinattan bulunur; kullanıcının verdiği dilim yok sayılırsa
        # sessizce yanlış harita (ya da yanıltıcı bir hata) üretilirdi.
        if value is not None and value.tzinfo is not None:
            raise ValueError(
                "Doğum saatini saat dilimi olmadan, yerel saat olarak giriniz (ör. 14:30). "
                "Saat dilimi doğum yerinden otomatik bulunur."
            )
        return value

    @field_validator("house_system")
    @classmethod
    def house_system_must_be_supported(cls, value: str) -> str:
        if value not in HOUSE_SYSTEMS:
            raise ValueError(f"Desteklenmeyen ev sistemi. Seçenekler: {', '.join(HOUSE_SYSTEMS)}")
        return value





class ChartCreateRequest(ChartCalculateRequest):
    """Haritayı kaydetmek için: hesaplama bilgilerine ek olarak ad ve yer adı."""

    name: str = Field(min_length=1, max_length=100, examples=["Benim haritam"])
    place_name: str = Field(min_length=1, max_length=200, examples=["Antalya, Türkiye"])

# =============================== YANIT ===============================
class FromAttributesModel(BaseModel):
    """Astro motorunun dataclass'larından doğrudan oluşturulabilen modellerin temeli."""

    model_config = ConfigDict(from_attributes=True)


class SignOut(FromAttributesModel):
    key: str
    name: str
    element: str
    modality: str


class PointOut(FromAttributesModel):
    longitude: float
    sign: SignOut
    formatted: str


class PlanetOut(FromAttributesModel):
    key: str
    name: str
    longitude: float
    sign: SignOut
    degree: float
    formatted: str
    speed: float
    retrograde: bool
    house: int | None


class AspectTypeOut(FromAttributesModel):
    key: str
    name: str
    angle: float
    orb: float


class AspectOut(FromAttributesModel):
    first: str
    second: str
    type: AspectTypeOut
    angle: float
    orb: float
    applying: bool


class HouseSystemOut(BaseModel):
    code: str
    name: str


class ChartResponse(BaseModel):
    utc_datetime: datetime
    utc_offset_hours: float
    timezone: str  # koordinattan bulunan IANA adı, ör. "Europe/Istanbul"
    time_known: bool
    house_system: HouseSystemOut | None  # saat bilinmiyorsa None
    ascendant: PointOut | None
    midheaven: PointOut | None
    houses: list[PointOut]  # sırayla 1.–12. ev; saat bilinmiyorsa boş
    planets: list[PlanetOut]
    aspects: list[AspectOut]
    warnings: list[str]
    engine_version: str




# =========================== KAYITLI HARİTALAR ===========================
class ChartRenameRequest(BaseModel):
    """Kayıtlı haritanın adını değiştirmek için."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100, examples=["Annemin haritası"])


class ChartSummaryOut(BaseModel):
    """Listedeki bir satır. Tüm harita verisi listede taşınmaz; sadece özet."""

    id: uuid.UUID
    name: str
    birth_date: date
    birth_time: time | None
    place_name: str
    sun_sign: SignOut
    moon_sign: SignOut
    ascendant_sign: SignOut | None  # doğum saati bilinmiyorsa None
    created_at: datetime


class ChartListOut(BaseModel):
    """Sayfalı liste: frontend "3. sayfa / 5" gösterebilsin diye toplam da döner."""

    items: list[ChartSummaryOut]
    total: int
    limit: int
    offset: int


class SavedChartOut(BaseModel):
    """Tek bir kayıtlı haritanın tamamı: kayıt bilgileri + hesaplanmış harita."""

    id: uuid.UUID
    name: str
    place_name: str
    birth_date: date
    birth_time: time | None
    latitude: float
    longitude: float
    created_at: datetime
    chart: ChartResponse