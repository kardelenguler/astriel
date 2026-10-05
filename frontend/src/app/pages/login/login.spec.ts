import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { User } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { Login } from './login';

const USER: User = { id: '1', username: 'kardelen', email: null, display_name: null };

// Sahte AuthService: backend'e istek atmaz, sadece nasıl çağrıldığını kaydeder.
// `result` ile girişin başarılı mı hatalı mı olacağını her test kendisi seçer.
class FakeAuthService {
  readonly calls: { username: string; password: string }[] = [];
  result: Observable<User> = of(USER);

  login(username: string, password: string): Observable<User> {
    this.calls.push({ username, password });
    return this.result;
  }
}

describe('Login', () => {
  let auth: FakeAuthService;
  let harness: RouterTestingHarness;
  let page: HTMLElement;
  let redirects: string[]; // giriş sonrası gidilmek istenen adresler

  beforeEach(() => {
    auth = new FakeAuthService();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'giris', component: Login }]),
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  /** Giriş sayfasını verilen adresle açar */
  async function open(url = '/giris'): Promise<void> {
    harness = await RouterTestingHarness.create(url);
    page = harness.routeNativeElement!;

    // Asıl yönlendirmeyi yapmak yerine nereye gidileceğini kaydet
    redirects = [];
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockImplementation((url) => {
      redirects.push(url.toString());
      return Promise.resolve(true);
    });
  }

  /** Kullanıcı gibi alana yazar */
  function type(id: 'username' | 'password', value: string): void {
    const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  /** Formu gönderir ve ekranı günceller */
  function submit(): void {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    harness.detectChanges();
  }

  it('boş form gönderilirse istek atmamalı ve alan hatalarını göstermeli', async () => {
    await open();

    submit();

    expect(auth.calls).toEqual([]);
    expect(page.textContent).toContain('Kullanıcı adını yaz.');
    expect(page.textContent).toContain('Şifreni yaz.');
  });

  it('başarılı girişte ana sayfaya yönlendirmeli', async () => {
    await open();

    type('username', 'kardelen');
    type('password', 'sifre123');
    submit();

    expect(auth.calls).toEqual([{ username: 'kardelen', password: 'sifre123' }]);
    expect(redirects).toEqual(['/']);
  });

  it('?donus adresi varsa giriş sonrası oraya dönmeli', async () => {
    await open('/giris?donus=%2Fharitalarim');

    type('username', 'kardelen');
    type('password', 'sifre123');
    submit();

    expect(redirects).toEqual(['/haritalarim']);
  });

  it('?donus başka bir siteyi gösteriyorsa ana sayfaya dönmeli', async () => {
    await open('/giris?donus=%2F%2Fkotu-site.com');

    type('username', 'kardelen');
    type('password', 'sifre123');
    submit();

    expect(redirects).toEqual(['/']);
  });

  it('hatalı girişte sunucunun mesajını göstermeli ve düğmeyi tekrar açmalı', async () => {
    auth.result = throwError(
      () =>
        new HttpErrorResponse({
          status: 401,
          error: { error: { message: 'Kullanıcı adı veya şifre hatalı.' } },
        }),
    );
    await open();

    type('username', 'kardelen');
    type('password', 'yanlis');
    submit();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Kullanıcı adı veya şifre hatalı.',
    );
    expect(page.querySelector<HTMLButtonElement>('.auth-submit')!.disabled).toBe(false);
    expect(redirects).toEqual([]);
  });

  it('oturum süresi dolduysa bilgi mesajı göstermeli', async () => {
    await open('/giris?oturum=doldu');

    expect(page.textContent).toContain('Oturumunun süresi doldu.');
  });

  it('"Göster" düğmesi şifreyi görünür yapmalı', async () => {
    await open();
    const password = page.querySelector<HTMLInputElement>('#password')!;
    expect(password.type).toBe('password');

    page.querySelector<HTMLButtonElement>('.toggle-password')!.click();
    harness.detectChanges();

    expect(password.type).toBe('text');
  });
});