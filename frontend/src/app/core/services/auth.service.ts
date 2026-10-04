import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';


import { environment } from '../../../environments/environment';
import { RegisterRequest, TokenResponse, User } from '../models/user';

const TOKEN_KEY = 'astriel_token';

// localStorage bazı durumlarda hata fırlatabilir (gizli sekme, engellenmiş
// site verisi). Uygulama bu yüzden çökmesin diye her erişim try/catch içinde.
function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    console.warn('Oturum bilgisi tarayıcıya kaydedilemedi.');
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Silinemese de yapacak bir şey yok; kullanıcı yine çıkış yapmış sayılır.
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly accountUrl = `${environment.apiUrl}/account`;

  // Giriş yapan kullanıcı (yoksa null). Dışarıdan sadece okunabilir.
  private readonly currentUser = signal<User | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  // Token var ama sunucuya ulaşılamadığı için kullanıcı bilgisi yüklenemediyse true.
  // Sayfalar bu durumda "Tekrar dene" gösterir (sonsuza kadar "yükleniyor" demez).
  private readonly restoreFailedState = signal(false);
  readonly restoreFailed = this.restoreFailedState.asReadonly();

  get token(): string | null {
    return readToken();
  }

  // Kayıt ol, ardından aynı bilgilerle otomatik giriş yap
  register(data: RegisterRequest): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/register`, data)
      .pipe(switchMap(() => this.login(data.username, data.password)));
  }

  // Backend giriş için JSON değil form verisi bekliyor (OAuth2 standardı).
  // HttpParams gövde olarak verilince Angular doğru formatta gönderir.
  login(username: string, password: string): Observable<User> {
    const body = new HttpParams()
      .set('username', username.trim().toLowerCase())
      .set('password', password);

    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, body).pipe(
      tap((res) => saveToken(res.access_token)),
      switchMap(() => this.loadCurrentUser()),
    );
  }

  // Sayfa yenilendiğinde: kayıtlı token varsa kullanıcıyı geri yükle.
  // SADECE token geçersizse (401) çıkış yapılır. Sunucu o an kapalıysa, Render
  // yeniden başlıyorsa ya da internet koptuysa kullanıcı boşuna çıkışa atılmaz.
  restoreSession(): void {
    if (!readToken()) {
      return;
    }
    this.restoreFailedState.set(false);
    this.loadCurrentUser().subscribe({
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.logout();
        } else {
          this.restoreFailedState.set(true);
        }
      },
    });
  }

  logout(): void {
    clearToken();
    this.currentUser.set(null);
    this.restoreFailedState.set(false);
  }

  // ---------- Hesap ayarları ----------
  /**
   * Şifreyi değiştirir. Backend eski şifreyle alınmış tüm token'ları geçersiz
   * sayar ve yeni token döndürür; bu cihazdaki oturum yeni token'la devam eder.
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .post<TokenResponse>(`${this.accountUrl}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .pipe(
        tap((res) => saveToken(res.access_token)),
        map(() => undefined),
      );
  }

  /** Hesabı kalıcı olarak siler; başarılı olursa oturumu da kapatır */
  deleteAccount(password: string): Observable<void> {
    return this.http
      .delete<void>(this.accountUrl, { body: { password } })
      .pipe(tap(() => this.logout()));
  }

  private loadCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${readToken()}` },
      })
      .pipe(tap((user) => this.currentUser.set(user)));
  }
}