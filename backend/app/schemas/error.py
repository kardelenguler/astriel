"""Hata yanıtlarının biçimi.

api/exception_handlers.py tüm hataları bu biçimde döndürür. Bu modeller
Swagger dokümantasyonunda gerçek biçimin görünmesini sağlar.
"""

from pydantic import BaseModel


class FieldError(BaseModel):
    field: str  # ör. "latitude"
    message: str


class ErrorDetail(BaseModel):
    code: str  # ör. "invalid_input", "not_found"
    message: str  # kullanıcıya gösterilecek Türkçe mesaj
    fields: list[FieldError] | None = None  # sadece form doğrulama hatalarında


class ErrorResponse(BaseModel):
    error: ErrorDetail 