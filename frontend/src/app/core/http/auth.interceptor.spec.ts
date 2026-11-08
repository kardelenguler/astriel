import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

const TOKEN_KEY = 'astriel_token';
const OUR_API = `${environment.apiUrl}/charts`;
const OTHER_SITE = 'https://baska-site.com/veri';

// Oturum düşünce yönlendirme ve 401 senaryoları auth.service.spec.ts'te test edildi.
// Burada anahtarın (token) hangi isteklere eklendiği test edilir.
describe('authInterceptor (Authorization başlığı)', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify(); // beklenmeyen istek kalmasın
    localStorage.clear();
  });

  it('giriş yapılmışsa kendi API isteğimize anahtarı eklemeli', () => {
    localStorage.setItem(TOKEN_KEY, 'gizli-token');

    http.get(OUR_API).subscribe();

    const req = backend.expectOne(OUR_API);
    expect(req.request.headers.get('Authorization')).toBe('Bearer gizli-token');
    req.flush([]);
  });

  it('başka bir siteye giden isteğe anahtarı ASLA eklememeli', () => {
    localStorage.setItem(TOKEN_KEY, 'gizli-token');

    http.get(OTHER_SITE).subscribe();

    const req = backend.expectOne(OTHER_SITE);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('giriş yapılmamışsa başlık eklememeli', () => {
    http.get(OUR_API).subscribe();

    const req = backend.expectOne(OUR_API);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('istekte zaten bir Authorization başlığı varsa onu değiştirmemeli', () => {
    localStorage.setItem(TOKEN_KEY, 'gizli-token');

    http.get(OUR_API, { headers: { Authorization: 'Bearer ozel-token' } }).subscribe();

    const req = backend.expectOne(OUR_API);
    expect(req.request.headers.get('Authorization')).toBe('Bearer ozel-token');
    req.flush([]);
  });

  it('401 dışındaki hatalarda (ör. 404) oturumu kapatmamalı', () => {
    localStorage.setItem(TOKEN_KEY, 'gizli-token');
    let failed = false;
    http.get(OUR_API).subscribe({ error: () => (failed = true) });

    backend.expectOne(OUR_API).flush(null, { status: 404, statusText: 'Not Found' });

    expect(failed).toBe(true); // hata sayfaya iletilir; sayfa kendi mesajını gösterir
    expect(localStorage.getItem(TOKEN_KEY)).toBe('gizli-token');
  });
});