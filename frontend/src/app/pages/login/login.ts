import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '../../core/http/error-message';
import { safeReturnUrl } from '../../core/navigation/return-url';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  /** Oturum süresi dolduğu için buraya yönlendirildiyse (?oturum=doldu) bilgi gösterilir */
  protected readonly sessionExpired =
    this.route.snapshot.queryParamMap.get('oturum') === 'doldu';

  /** Kayıt oldu ama otomatik giriş yapılamadıysa (?kayit=tamam) bilgi gösterilir */
  protected readonly justRegistered =
    this.route.snapshot.queryParamMap.get('kayit') === 'tamam';

  hasError(name: 'username' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.loading()) {
      return; // çift tıklamada iki istek gitmesin
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // boş alanların hatası görünsün
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();

    this.auth.login(username, password).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl()),
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  // Giriş sayfasına başka bir sayfadan yönlendirildiyse giriş sonrası oraya dön
  private returnUrl(): string {
    return safeReturnUrl(this.route);
  }
}