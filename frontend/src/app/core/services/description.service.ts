import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Rotada açıklama yoksa bu kullanılır (index.html'deki ile aynı) */
export const DEFAULT_DESCRIPTION =
  'Doğum tarihini, saatini ve yerini gir; gezegenlerin, evlerin ve açıların o anki haritasını gerçek efemeris verisiyle hesapla.';

/**
 * Her sayfa değişiminde <meta name="description"> etiketini günceller.
 * Google arama sonucunda başlığın altındaki gri metin budur.
 * Açıklama app.routes.ts'de her rotanın data.description alanına yazılır.
 */
@Injectable({ providedIn: 'root' })
export class DescriptionService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);

  /** Uygulama açılırken bir kez çağrılır (app.ts) */
  init(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.update());
  }

  private update(): void {
    // En içteki (asıl açılan) sayfanın rotasını bul
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const description = (route.data['description'] as string | undefined) ?? DEFAULT_DESCRIPTION;
    this.meta.updateTag({ name: 'description', content: description });
  }
}