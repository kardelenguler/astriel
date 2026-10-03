"""Hataları frontend için tek tip JSON yanıtına çevirir.

Her hata aynı biçimde döner; Angular tek bir yerden yakalayıp gösterebilir:

    {"error": {"code": "invalid_input", "message": "...", "fields": [...]}}

"fields" sadece form doğrulama hatalarında bulunur (hangi alan, ne sorun).
"""

import logging
from collections.abc import Awaitable, Callable, Sequence 
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response 
from starlette.exceptions import HTTPException as StarletteHTTPException 
from app.core.exceptions import AppError

logger = logging.getLogger(__name__)

# Hatanın isteğin neresinde olduğunu belirten önekler; alan adına dahil edilmez
_LOCATION_PREFIXES = frozenset({"body", "query", "path", "header", "cookie"})

# Pydantic hata türü -> Türkçe şablon. {le}, {min_length} gibi yer tutucular
# hatanın 'ctx' alanından doldurulur. Listede olmayan türlerde orijinal mesaj kalır.
_TURKISH_MESSAGES: dict[str, str] = {
    "missing": "Bu alan zorunludur.",
    "less_than_equal": "En fazla {le} olabilir.",
    "greater_than_equal": "En az {ge} olabilir.",
    "less_than": "{lt} değerinden küçük olmalıdır.",
    "greater_than": "{gt} değerinden büyük olmalıdır.",
    "string_too_short": "En az {min_length} karakter olmalıdır.",
    "string_too_long": "En fazla {max_length} karakter olabilir.",
    "string_type": "Metin olmalıdır.",
    "float_parsing": "Geçerli bir sayı giriniz.",
    "float_type": "Geçerli bir sayı giriniz.",
    "int_parsing": "Geçerli bir tam sayı giriniz.",
    "int_type": "Geçerli bir tam sayı giriniz.",
    "date_parsing": "Geçerli bir tarih giriniz (YYYY-AA-GG).",
    "date_from_datetime_parsing": "Geçerli bir tarih giriniz (YYYY-AA-GG).",
    "date_type": "Geçerli bir tarih giriniz (YYYY-AA-GG).",
    "time_parsing": "Geçerli bir saat giriniz (SS:DD).",
    "time_type": "Geçerli bir saat giriniz (SS:DD).",
    "bool_parsing": "Doğru ya da yanlış olmalıdır.",
    "uuid_parsing": "Geçerli bir kimlik değil.",
    "json_invalid": "İstek gövdesi geçerli bir JSON değil.",
}


def format_field_path(location: Sequence[Any]) -> str:
    """("body", "latitude") -> "latitude";  ("query", "limit") -> "limit"."""
    parts = list(location)
    if parts and parts[0] in _LOCATION_PREFIXES:
        parts = parts[1:]
    return ".".join(str(part) for part in parts)

def _display_value(value: Any) -> Any:
    """90.0 -> 90 (kullanıcıya '90.0' yerine '90' gösterilsin); diğerleri aynen kalır."""
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value 



def translate_message(error: dict[str, Any]) -> str:
    """Pydantic hatasını Türkçe mesaja çevirir.

    Bizim validator'larımızdaki ValueError mesajları zaten Türkçedir;
    Pydantic onların başına "Value error, " ekler, o önek temizlenir.
    """
    template = _TURKISH_MESSAGES.get(error["type"])
    if template is None:
        return error["msg"].removeprefix("Value error, ")
    try:
        context = {key: _display_value(value) for key, value in error.get("ctx", {}).items()}
        return template.format(**context) 
    except (KeyError, IndexError):
        # Şablonda beklenen bir değer ctx'te yoksa orijinal mesaja dön
        return error["msg"].removeprefix("Value error, ") 

def _error_response(
    status_code: int,
    code: str,
    message: str,
    fields: list[dict] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    error: dict = {"code": code, "message": message}
    if fields:
        error["fields"] = fields
    return JSONResponse(status_code=status_code, content={"error": error}, headers=headers) 


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Bizim fırlattığımız hatalar (NotFoundError, InvalidInputError, ...)."""
    log = logger.error if exc.status_code >= 500 else logger.warning
    log("%s %s -> %s: %s", request.method, request.url.path, exc.code, exc.detail or exc.message)
    return _error_response(exc.status_code, exc.code, exc.message)



# Starlette'in kendi fırlattığı HTTP hataları (olmayan adres, yanlış metot...) -> kod ve Türkçe mesaj
_HTTP_ERRORS: dict[int, tuple[str, str]] = {
    401: ("unauthorized", "Lütfen giriş yapın."), 
    404: ("not_found", "Aradığınız adres bulunamadı."),
    405: ("method_not_allowed", "Bu adres bu işlem türünü desteklemiyor."),
}


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Olmayan adres (404), yanlış HTTP metodu (405) gibi hatalar."""
    code, message = _HTTP_ERRORS.get(exc.status_code, ("http_error", "İstek işlenemedi."))
    logger.warning("%s %s -> %s", request.method, request.url.path, exc.status_code)
    # exc.headers: ör. 405'teki 'Allow' başlığı korunur
    return _error_response(exc.status_code, code, message, headers=exc.headers)




async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Pydantic şema doğrulaması başarısız oldu (ör. enlem 95, tarih boş)."""
    fields = [
        {"field": format_field_path(error["loc"]), "message": translate_message(error)}
        for error in exc.errors()
    ]
    logger.info("%s %s -> doğrulama hatası: %s", request.method, request.url.path, fields)
    return _error_response(
        status.HTTP_422_UNPROCESSABLE_CONTENT,
        "invalid_input",
        "Girilen bilgiler geçersiz. Lütfen işaretli alanları kontrol edin.",
        fields,
    )


async def unhandled_error_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Beklenmeyen her şey: ayrıntı log'a yazılır, kullanıcıya genel mesaj gösterilir.

    Handler yerine middleware kullanılır, çünkü Starlette 'Exception' handler'ını
    en dıştaki katmanda (CORS'un da dışında) çalıştırır. O zaman 500 yanıtına
    CORS başlığı eklenmez ve Angular hata mesajı yerine sadece 'CORS error' görür.
    """
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Beklenmeyen hata: %s %s", request.method, request.url.path)
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "internal_error", AppError.default_message
        ) 


def register_exception_handlers(app: FastAPI) -> None:
    """main.py'de CORS middleware'inden ÖNCE çağrılmalıdır (sıra önemli)."""
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.middleware("http")(unhandled_error_middleware) 