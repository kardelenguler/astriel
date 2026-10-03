import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Backend'e giden her isteğe giriş anahtarını ekler.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  // Anahtarı sadece kendi API'mize gönder, başka sitelere asla gönderme
  const isOurApi = req.url.startsWith(environment.apiUrl);

  const request =
    token && isOurApi && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      // Giriş yapmışken 401 geldiyse oturum geçersiz demektir: çıkış yap.
      // (Token yokken gelen 401, ör. yanlış şifre, bu kuraldan etkilenmez.)
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
}; 