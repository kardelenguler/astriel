import { Component, ElementRef, afterRenderEffect, inject, input, output } from '@angular/core';

import { Interpretation } from '../../core/models/interpretation';

/** Ev, nokta ya da gezegen kartına tıklanınca açılan açıklama kutusu */
@Component({
  selector: 'app-interpretation-panel',
  templateUrl: './interpretation-panel.html',
  styleUrl: './interpretation-panel.scss',
  host: {
    '(document:keydown.escape)': 'closed.emit()', // Esc ile kapansın
  },
})
export class InterpretationPanel {
  readonly interpretation = input.required<Interpretation>();
  readonly closed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Kutu açılınca ya da içeriği değişince (başka bir karta geçilince)
    // ekrana çizildikten sonra sayfayı kutuya kaydır
    afterRenderEffect(() => {
      this.interpretation(); // bu değer değişince yeniden çalışsın

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      // "?." : test ortamında bu fonksiyon yok, orada hata vermesin
      this.host.nativeElement.scrollIntoView?.({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest', // kutu zaten görünüyorsa sayfa yerinden oynamaz
      });
    });
  }
}