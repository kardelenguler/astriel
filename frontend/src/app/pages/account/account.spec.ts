import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Account } from './account';

describe('Account', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('oluşturulabilmeli', () => {
    const fixture = TestBed.createComponent(Account);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('yeni şifreler aynı değilse form geçersiz olmalı', () => {
    const form = TestBed.createComponent(Account).componentInstance.passwordForm;
    form.setValue({
      currentPassword: 'eski-sifre-123',
      newPassword: 'yeni-sifre-456',
      newPasswordConfirm: 'baska-sifre-789',
    });

    expect(form.hasError('passwordMismatch')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it('giriş yapılmamışken silme onayı kabul edilmemeli', () => {
    const component = TestBed.createComponent(Account).componentInstance;
    component.deleteForm.controls.confirmUsername.setValue('herhangi');

    expect(component.usernameConfirmed()).toBe(false);
  });
});