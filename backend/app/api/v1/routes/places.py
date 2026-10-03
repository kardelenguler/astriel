"""Yer arama endpoint'i: doğum yeri adı -> koordinat.

Herkese açık (misafir de harita hesaplarken kullanır).
"""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import GeocoderDep
from app.core.exceptions import InvalidInputError
from app.schemas.error import ErrorResponse
from app.schemas.place import PlaceOut

router = APIRouter(prefix="/places")


@router.get(
    "/search",
    response_model=list[PlaceOut],
    summary="Yer adından koordinat bul",
    description=(
        "Sadece kullanıcı **Ara**'ya bastığında çağrılmalıdır. Her tuşta çağırmak "
        "(otomatik tamamlama) Nominatim kullanım kurallarına aykırıdır."
    ),
    responses={503: {"model": ErrorResponse, "description": "Yer arama servisine ulaşılamıyor"}},
)
def search_places(
    geocoder: GeocoderDep,
    q: Annotated[str, Query(max_length=100, description="Ör. Antalya")],
) -> list[PlaceOut]:
    query = q.strip()
    if len(query) < 2:
        # "   " gibi sadece boşluktan oluşan aramalar Nominatim'e hiç gönderilmez
        raise InvalidInputError("Aramak için en az 2 harf yazın.")
    return [PlaceOut.model_validate(place) for place in geocoder.search(query)] 