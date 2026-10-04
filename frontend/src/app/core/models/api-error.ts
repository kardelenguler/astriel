/**
 * Backend'in TÜM hatalarda döndüğü ortak biçim.
 * Backend: app/schemas/error.py -> ErrorResponse
 *
 *   {"error": {"code": "invalid_input", "message": "...", "fields": [...]}}
 */
export interface FieldError {
  field: string; // "latitude"
  message: string; // Türkçe hata mesajı
}

export interface ApiErrorBody {
  code: string; // "invalid_input", "not_found", "service_unavailable"...
  message: string; // kullanıcıya gösterilecek Türkçe mesaj
  fields?: FieldError[]; // sadece form doğrulama hatalarında
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}