import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const COUNTER_URL = 'https://astriel.goatcounter.com/count';

// Geliştirirken açılan sayfalar sayaca eklenmesin
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Sayfa görüntülemelerini GoatCounter'a bildirir (çerezsiz, kişisel veri yok).
 *
 * GoatCounter'ın hazır betiği (count.js) KULLANILMAZ: o betik adresin "?..." kısmını
 * (doğum tarihi, saati, koordinat) kendiliğinden gönderiyordu. Burada sayaca SADECE
 * sayfa adı gider: /harita?tarih=... -> /harita
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
    if (LOCAL_HOSTS.has(this.document.location.hostname)) {
      return;
    }
    try {
      // Görünmez 1 piksellik resim isteği: GoatCounter'ın betiksiz sayma yöntemi.
      // Reklam engelleyici engellerse sadece sayılmaz; site etkilenmez.
      const image = new Image();
      image.src = `${COUNTER_URL}?p=${encodeURIComponent(path)}`;
    } catch {
      // Sayaç çalışmasa da site çalışmaya devam etmeli
    }
  }
}