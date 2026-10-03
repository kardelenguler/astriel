import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Sadece giriş yapmış kullanıcıların girebileceği sayfalar için.
// Kullanıcı bilgisi sayfa yenilenince birkaç milisaniye sonra yüklendiği için
// burada token'ın varlığına bakıyoruz. Token geçersizse interceptor çıkış yaptırır.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.token) {
    return true;
  }
  // Giriş sayfasına gönder, giriş yapınca bu sayfaya geri dönsün
  return router.createUrlTree(['/giris'], { queryParams: { donus: state.url } });
};

// Giriş ve kayıt sayfaları için: zaten giriş yapmış olan ana sayfaya gitsin.
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.token ? router.createUrlTree(['/']) : true;
}; 