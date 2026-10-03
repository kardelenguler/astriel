import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorResponse } from '../models/api-error';

const DEFAULT_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

/**
 * Herhangi bir hatadan kullanıcıya gösterilecek Türkçe mesajı çıkarır.
 * Uygulama hiçbir durumda sessizce çökmemeli ve kullanıcıya teknik bir mesaj göstermemeli.
 */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return DEFAULT_MESSAGE;
  }

  // status 0: istek sunucuya hiç ulaşamadı (backend kapalı, internet yok, CORS hatası)
  if (error.status === 0) {
    return 'Sunucuya ulaşılamıyor. İnternet bağlantını kontrol edip tekrar dene.';
  }

  // Backend'in ortak hata biçimi: {"error": {"message": "..."}}
  const body = error.error as Partial<ApiErrorResponse> | null;
  return body?.error?.message ?? DEFAULT_MESSAGE;
} 