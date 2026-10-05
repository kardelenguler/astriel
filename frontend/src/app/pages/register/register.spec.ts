import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { RegisterRequest, User } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { Register } from './register';

const USER: User = { id: '1', username: 'kardelen', email: null, display_name: null };

// Sahte AuthService: backend'e istek atmaz, sadece hangi bilgiyle çağrıldığını kaydeder.
class FakeAuthService {
  readonly requests: RegisterRequest[] = [];
  result: Observable<User> = of(USER);

  register(request: RegisterRequest): Observable<User> {
    this.requests.push(request);
    return this.result;
  }
}

type FieldId = 'username' | 'password' | 'passwordConfirm' | 'email' | 'displayName';

describe('Register', () => {
  let auth: FakeAuthService;
  let harness: RouterTestingHarness;
  let page: HTMLElement;
  let redirects: string[];

  beforeEach(async () => {
    auth = new FakeAuthService();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'kayit', component: Register }]),
        { provide: AuthService, useValue: auth },
      ],
    });

    harness = await RouterTestingHarness.create('/kayit');
    page = harness.routeNativeElement!;

    redirects = [];
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockImplementation((url) => {
      redirects.push(url.toString());
      return Promise.resolve(true);
    });
  });

  /** Kullanıcı gibi alana yazar */
  function type(id: FieldId, value: string): void {
    const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  /** Zorunlu alanları geçerli bilgilerle doldurur */
  function fillRequired(): void {
    type('username', 'kardelen');
    type('password', 'sifre1234');
    type('passwordConfirm', 'sifre1234');
  }

  /** Formu gönderir ve ekranı günceller */
  function submit(): void {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    harness.detectChanges();
  }

  it('boş form gönderilirse istek atmamalı ve alan hatalarını göstermeli', () => {
    submit();

    expect(auth.requests).toEqual([]);
    expect(page.textContent).toContain('Bir kullanıcı adı seç.');
    expect(page.textContent).toContain('Bir şifre belirle.');
    expect(page.textContent).toContain('Şifreni tekrar yaz.');
  });

  it('kullanıcı adında geçersiz karakter varsa istek atmamalı', () => {
    fillRequired();
    type('username', 'kardelen!');
    submit();

    expect(auth.requests).toEqual([]);
    expect(page.textContent).toContain('Sadece harf, rakam ve _ kullanabilirsin.');
  });

  it('şifre 8 karakterden kısaysa istek atmamalı', () => {
    fillRequired();
    type('password', 'kisa');
    type('passwordConfirm', 'kisa');
    submit();

    expect(auth.requests).toEqual([]);
    expect(page.textContent).toContain('Şifre en az 8 karakter olmalı.');
  });

  it('şifreler aynı değilse istek atmamalı', () => {
    fillRequired();
    type('passwordConfirm', 'baska1234');
    submit();

    expect(auth.requests).toEqual([]);
    expect(page.textContent).toContain('Şifreler aynı değil.');
  });

  it('e-posta geçersizse istek atmamalı', () => {
    fillRequired();
    type('email', 'gecersiz-eposta');
    submit();

    expect(auth.requests).toEqual([]);
    expect(page.textContent).toContain('Geçerli bir e-posta adresi yaz');
  });

  it('başarılı kayıtta boş isteğe bağlı alanları göndermemeli ve ana sayfaya gitmeli', () => {
    fillRequired();
    submit();

    expect(auth.requests).toEqual([{ username: 'kardelen', password: 'sifre1234' }]);
    expect(redirects).toEqual(['/']);
  });

  it('kullanıcı adını küçük harfe çevirmeli, boşlukları temizlemeli', () => {
    fillRequired();
    type('username', '  Kardelen_11 ');
    type('email', ' kardelen@ornek.com ');
    type('displayName', ' Kardelen ');
    submit();

    expect(auth.requests).toEqual([
      {
        username: 'kardelen_11',
        password: 'sifre1234',
        email: 'kardelen@ornek.com',
        display_name: 'Kardelen',
      },
    ]);
  });

  it('kullanıcı adı alınmışsa sunucunun mesajını göstermeli', () => {
    auth.result = throwError(
      () =>
        new HttpErrorResponse({
          status: 409,
          error: { error: { message: 'Bu kullanıcı adı zaten alınmış.' } },
        }),
    );
    fillRequired();
    submit();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Bu kullanıcı adı zaten alınmış.',
    );
    expect(page.querySelector<HTMLButtonElement>('.auth-submit')!.disabled).toBe(false);
    expect(redirects).toEqual([]);
  });
});