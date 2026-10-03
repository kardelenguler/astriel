"""Uygulamaya özel hata sınıfları.

Servisler ve hesaplama motoru hata durumunda bu sınıfları fırlatır (raise).
API katmanı bunları yakalayıp frontend'e her zaman aynı biçimde yanıt döner:

    {"error": {"code": "not_found", "message": "Harita bulunamadı."}}

- message: Kullanıcıya gösterilir. Türkçe ve anlaşılır olmalı.
- detail:  Teknik ayrıntı. Kullanıcıya gösterilmez, sadece loglanır.
"""


class AppError(Exception):
    """Tüm uygulama hatalarının temel sınıfı."""

    status_code: int = 500
    code: str = "internal_error"
    default_message: str = "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."

    def __init__(self, message: str | None = None, *, detail: str | None = None) -> None:
        self.message = message or self.default_message
        self.detail = detail
        super().__init__(detail or self.message)


class InvalidInputError(AppError):
    status_code = 422
    code = "invalid_input"
    default_message = "Girilen bilgiler geçersiz."


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"
    default_message = "Aradığınız kayıt bulunamadı."


class ConflictError(AppError):
    status_code = 409
    code = "conflict"
    default_message = "Bu kayıt zaten mevcut."


class AuthenticationError(AppError):
    status_code = 401
    code = "unauthorized"
    default_message = "Lütfen giriş yapın."


class PermissionDeniedError(AppError):
    status_code = 403
    code = "forbidden"
    default_message = "Bu işlem için yetkiniz yok."


class TooManyRequestsError(AppError):
    status_code = 429
    code = "too_many_requests"
    default_message = "Çok fazla hatalı deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin."


class ExternalServiceError(AppError):
    status_code = 503
    code = "service_unavailable"
    default_message = "Dış servise şu anda ulaşılamıyor. Lütfen biraz sonra tekrar deneyin."


class CalculationError(AppError):
    status_code = 500
    code = "calculation_error"
    default_message = "Harita hesaplanırken bir sorun oluştu." 