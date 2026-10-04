import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { authGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';

/** Şu an açık olan sayfa giriş gerektiriyor mu? (rotasında authGuard var mı) */
function currentPageNeedsLogin(route: ActivatedRouteSnapshot | null): boolean {
  while (route) {
    if (route.routeConfig?.canActivate?.includes(authGuard)) {
      return true;
    }
    route = route.firstChild;
  }
  return false;
}

// Backend'e giden her isteğe giriş anahtarını ekler.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  // Anahtarı sadece kendi API'mize gönder, başka sitelere asla gönderme
  const isOurApi = req.url.startsWith(environment.apiUrl);

  const request =
    token && isOurApi && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      // Giriş yapmışken 401 geldiyse oturum geçersiz demektir (ör. süresi doldu): çıkış yap.
      // (Token yokken gelen 401, ör. yanlış şifre, bu kuraldan etkilenmez.)
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout();

        // Giriş gerektiren bir sayfadaysa giriş sayfasına gönder; giriş yapınca
        // aynı sayfaya geri dönsün. Herkese açık sayfadaysa (ana sayfa vb.) yerinde kalsın.
        if (currentPageNeedsLogin(router.routerState.snapshot.root)) {
          router.navigate(['/giris'], {
            queryParams: { donus: router.url, oturum: 'doldu' },
          });
        }
      }
      return throwError(() => error);
    }),
  );
};