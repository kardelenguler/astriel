import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Her sayfa değişiminde <link rel="canonical"> etiketini günceller.
 * Google aynı sayfanın farklı adreslerini (?utm=..., sondaki / vb.) tek sayfa sayar.
 * Adresteki ?... kısmı canonical'a yazılmaz.
 */
@Injectable({ providedIn: 'root' })
export class CanonicalService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /** Uygulama açılırken bir kez çağrılır (app.ts) */
  init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.update(event.urlAfterRedirects));
  }

  private update(url: string): void {
    const path = url.split(/[?#]/)[0]; // "/harita?tarih=..." -> "/harita"
    const href = this.document.location.origin + path;

    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = href;
  }
}