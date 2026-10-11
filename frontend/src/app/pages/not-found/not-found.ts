import { Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

/**
 * Olmayan adresler için "Sayfa bulunamadı" ekranı.
 *
 * Sunucu her adres için index.html döndürdüğü (durum kodu 200) için Google bu
 * sayfaları gerçek sayfa sanabilir. Bu yüzden ekran açıkken "noindex" etiketi
 * eklenir, başka bir sayfaya geçilince kaldırılır.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  constructor() {
    const meta = inject(Meta);
    meta.updateTag({ name: 'robots', content: 'noindex' });
    inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
  }
}