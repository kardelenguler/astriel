import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorResponse } from '../models/api-error';

const DEFAULT_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

/** Backend'in alan adları -> kullanıcının formda gördüğü etiket */
const FIELD_LABELS: Record<string, string> = {
  username: 'Kullanıcı Adı',
  password: 'Şifre',
  email: 'E-posta',
  display_name: 'Görünen Ad',
  current_password: 'Mevcut Şifre',
  new_password: 'Yeni Şifre',
  name: 'Harita Adı',
  place_name: 'Doğum Yeri',
  birth_date: 'Doğum Tarihi',
  birth_time: 'Doğum Saati',
  latitude: 'Enlem',
  longitude: 'Boylam',
};

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

  // Backend'in ortak hata biçimi: {"error": {"message": "...", "fields": [...]}}
  const body = (error.error as Partial<ApiErrorResponse> | null)?.error;

  // Form doğrulama hatası: genel mesaj yerine HANGİ alanın NEDEN hatalı olduğunu göster
  // Ör. "E-posta: Geçerli bir e-posta adresi giriniz."
  if (body?.fields?.length) {
    return body.fields
      .map((field) => {
        const label = FIELD_LABELS[field.field];
        return label ? `${label}: ${field.message}` : field.message;
      })
      .join(' ');
  }

  return body?.message ?? DEFAULT_MESSAGE;
}
