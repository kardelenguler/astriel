import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

// GoatCounter betiğinin (index.html) tarayıcıya eklediği nesne
declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string }) => void };
  }
}

/**
 * Sayfa görüntülemelerini GoatCounter'a bildirir (çerezsiz, kişisel veri yok).
 * Adresin sadece sayfa kısmı gönderilir: /harita?tarih=... -> /harita
 * Böylece doğum bilgileri ve harita id'leri sayaca hiç ulaşmaz.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /** Uygulama açılırken bir kez çağrılır (app.ts) */
  init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.count(this.toSafePath(event.urlAfterRedirects)));
  }

  /** "/harita?tarih=..." -> "/harita", "/harita/<id>" -> "/harita/kayitli" */
  toSafePath(url: string): string {
    const path = url.split(/[?#]/)[0];
    return path.startsWith('/harita/') ? '/harita/kayitli' : path;
  }

  private count(path: string): void {
    const counter = this.document.defaultView?.goatcounter;
    if (counter) {
      counter.count({ path });
      return;
    }
    // Betik henüz yüklenmediyse (ilk açılış) yüklenince say.
    // Reklam engelleyici betiği engellediyse hiçbir şey olmaz; site etkilenmez.
    this.document
      .getElementById('goatcounter')
      ?.addEventListener('load', () => this.document.defaultView?.goatcounter?.count({ path }), {
        once: true,
      });
  }
} 