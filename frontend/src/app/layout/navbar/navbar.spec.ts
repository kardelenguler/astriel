import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Navbar } from './navbar';

describe('Navbar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('oluşturulabilmeli', () => {
    const fixture = TestBed.createComponent(Navbar);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('giriş yapılmamışken "Giriş Yap" ve "Kayıt Ol" gösterilmeli', async () => {
    const fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Giriş Yap');
    expect(text).toContain('Kayıt Ol');
  });
});

@Component({ template: '' })
class EmptyPage {}

describe('Navbar: Rehber bağlantısı', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: EmptyPage }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  /** Verilen adrese gidince menüdeki "Rehber" seçili mi? */
  async function guideLinkActiveAt(url: string): Promise<boolean> {
    const fixture = TestBed.createComponent(Navbar);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/rehber"]');
    return link!.classList.contains('active');
  }

  it('ev ve burç sayfalarında seçili görünmeli', async () => {
    expect(await guideLinkActiveAt('/burclar/akrep')).toBe(true);
  });

  it('diğer sayfalarda seçili görünmemeli', async () => {
    expect(await guideLinkActiveAt('/hakkinda')).toBe(false);
  });
});