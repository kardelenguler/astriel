import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { getErrorMessage } from '../../core/http/error-message';
import { AuthService } from '../../core/services/auth.service';

/** Yeni şifre ile tekrarı aynı mı? */
export function newPasswordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('newPasswordConfirm')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // ---------- Şifre değiştirme ----------
  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      newPasswordConfirm: ['', Validators.required],
    },
    { validators: newPasswordsMatch },
  );
  readonly passwordSaving = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);

  // ---------- Hesap silme ----------
  readonly deleteForm = this.fb.nonNullable.group({
    confirmUsername: ['', Validators.required],
    password: ['', Validators.required],
  });
  readonly deleteOpen = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  passwordFieldError(
    name: 'currentPassword' | 'newPassword' | 'newPasswordConfirm',
    error: string,
  ): boolean {
    const control = this.passwordForm.controls[name];
    return control.touched && control.hasError(error);
  }

  get passwordMismatch(): boolean {
    return (
      this.passwordForm.hasError('passwordMismatch') &&
      this.passwordForm.controls.newPasswordConfirm.touched
    );
  }

  changePassword(): void {
    if (this.passwordSaving()) {
      return;
    }
    this.passwordSuccess.set(false);
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSaving.set(true);
    this.passwordError.set(null);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.auth
      .changePassword(currentPassword, newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.passwordSuccess.set(true);
          this.passwordSaving.set(false);
        },
        error: (error) => {
          this.passwordError.set(getErrorMessage(error));
          this.passwordSaving.set(false);
        },
      });
  }

  /** Silme düğmesi ancak kullanıcı adı doğru yazılınca aktif olur */
  usernameConfirmed(): boolean {
    const username = this.auth.user()?.username;
    const typed = this.deleteForm.controls.confirmUsername.value.trim().toLowerCase();
    return !!username && typed === username;
  }

  cancelDelete(): void {
    this.deleteOpen.set(false);
    this.deleteForm.reset();
    this.deleteError.set(null);
  }

  deleteAccount(): void {
    if (this.deleting()) {
      return;
    }
    if (this.deleteForm.invalid || !this.usernameConfirmed()) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.auth
      .deleteAccount(this.deleteForm.controls.password.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (error) => {
          this.deleteError.set(getErrorMessage(error));
          this.deleting.set(false);
        },
      });
  }
} 