import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';

@Component({ template: '' })
class EmptyPage {}

const TOKEN_KEY = 'astriel_token';

describe('authGuard ve guestGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'giris', component: EmptyPage, canActivate: [guestGuard] },
          { path: 'kayit', component: EmptyPage, canActivate: [guestGuard] },
          { path: 'haritalarim', component: EmptyPage, canActivate: [authGuard] },
        ]),
        // AuthService HttpClient ister; bu testlerde istek atılmaz
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.restoreAllMocks(); // önce sahte localStorage'ı geri al, sonra temizle
    localStorage.clear();
  });

  // ----------------------------- authGuard -----------------------------
  it('giriş yapmamış kullanıcıyı giriş sayfasına göndermeli, dönüş adresini eklemeli', async () => {
    await router.navigateByUrl('/haritalarim');

    expect(router.url).toBe('/giris?donus=%2Fharitalarim');
  });

  it('giriş yapmış kullanıcıyı sayfaya almalı', async () => {
    localStorage.setItem(TOKEN_KEY, 'gecerli-token');

    await router.navigateByUrl('/haritalarim');

    expect(router.url).toBe('/haritalarim');
  });

  // ----------------------------- guestGuard -----------------------------
  it('giriş yapmamış kullanıcı giriş ve kayıt sayfalarını açabilmeli', async () => {
    await router.navigateByUrl('/giris');
    expect(router.url).toBe('/giris');

    await router.navigateByUrl('/kayit');
    expect(router.url).toBe('/kayit');
  });

  it('giriş yapmış kullanıcıyı giriş ve kayıt sayfalarından ana sayfaya göndermeli', async () => {
    localStorage.setItem(TOKEN_KEY, 'gecerli-token');

    await router.navigateByUrl('/giris');
    expect(router.url).toBe('/');

    await router.navigateByUrl('/kayit');
    expect(router.url).toBe('/');
  });

  it('localStorage hata fırlatsa bile çökmemeli, giriş yapmamış sayılmalı', async () => {
    // Gizli sekme / engellenmiş site verisi durumu
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('erişim engellendi');
    });

    await router.navigateByUrl('/haritalarim');

    expect(router.url).toBe('/giris?donus=%2Fharitalarim');
  });
});