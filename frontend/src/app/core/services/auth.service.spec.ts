import { Component } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { authGuard } from '../guards/auth.guard';
import { authInterceptor } from '../http/auth.interceptor';
import { AuthService } from './auth.service';

const ME_URL = `${environment.apiUrl}/auth/me`;
const USER = { id: '1', username: 'kardelen', email: null, display_name: null };

@Component({ template: '' })
class EmptyPage {}

/** Router'ın yönlendirmeyi bitirmesini bekler */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('AuthService + authInterceptor (oturum)', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.setItem('astriel_token', 'eski-token'); // daha önce giriş yapılmış
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'giris', component: EmptyPage },
          { path: 'hesabim', component: EmptyPage, canActivate: [authGuard] },
        ]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify(); // beklenmeyen istek kalmasın
    localStorage.clear();
  });

  it('kayıtlı oturumu geri yüklemeli', () => {
    auth.restoreSession();
    http.expectOne(ME_URL).flush(USER);

    expect(auth.user()?.username).toBe('kardelen');
  });

  it('token geçersizse (401) çıkış yapmalı', () => {
    auth.restoreSession();
    http.expectOne(ME_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.token).toBeNull();
    expect(auth.restoreFailed()).toBe(false);
  });

  it('sunucuya ulaşılamazsa çıkış YAPMAMALI, "tekrar dene" durumuna geçmeli', () => {
    auth.restoreSession();
    http.expectOne(ME_URL).flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(auth.token).toBe('eski-token');
    expect(auth.restoreFailed()).toBe(true);
  });

  it('giriş gerektiren sayfada oturum düşerse giriş sayfasına yönlendirmeli', async () => {
    await router.navigateByUrl('/hesabim');

    auth.restoreSession();
    http.expectOne(ME_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    await settle();

    expect(router.url).toBe('/giris?donus=%2Fhesabim&oturum=doldu');
  });

  it('herkese açık sayfada oturum düşerse sayfada kalmalı', async () => {
    await router.navigateByUrl('/');

    auth.restoreSession();
    http.expectOne(ME_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    await settle();

    expect(router.url).toBe('/');
  });
});