import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '../../core/http/error-message';
import { RegisterRequest } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';

// Backend'deki kuralın aynısı: 3–30 karakter, harf/rakam/alt çizgi.
// Büyük harfe izin veriyoruz, göndermeden önce küçük harfe çeviriyoruz.
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

// İki şifre alanı aynı mı?
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('passwordConfirm')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

type FieldName = 'username' | 'password' | 'passwordConfirm' | 'email' | 'displayName';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.pattern(USERNAME_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      passwordConfirm: ['', Validators.required],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      displayName: ['', Validators.maxLength(100)],
    },
    { validators: passwordsMatch },
  );

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  hasError(name: FieldName, error?: string): boolean {
    const control = this.form.controls[name];
    if (!control.touched) {
      return false;
    }
    return error ? control.hasError(error) : control.invalid;
  }

  // "Şifreler aynı değil" hatası tek bir alana değil, forma ait
  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.form.controls.passwordConfirm.touched;
  }

  onSubmit(): void {
    if (this.loading()) {
      return;
    }
    // Baştaki/sondaki boşlukları temizle (ör. "kardelen " yazılırsa)
    const username = this.form.controls.username;
    username.setValue(username.value.trim());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const request: RegisterRequest = {
      username: value.username.toLowerCase(),
      password: value.password,
    };
    // Boş bırakılan isteğe bağlı alanları hiç gönderme
    if (value.email.trim()) {
      request.email = value.email.trim();
    }
    if (value.displayName.trim()) {
      request.display_name = value.displayName.trim();
    }

    this.auth.register(request).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}