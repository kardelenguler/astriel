import { Component, computed, input, signal } from '@angular/core';

import { ChartResponse } from '../../core/models/chart';

type View = 'planets' | 'houses' | 'aspects';

/**
 * Bir haritanın Gezegenler, Evler ve Açılar tabloları.
 * `only` verilirse sadece o tablo gösterilir (üstteki sekmeler çıkmaz); verilmezse kendi sekmeleri olur.
 */
@Component({
  selector: 'app-chart-tables',
  templateUrl: './chart-tables.html',
  styleUrl: './chart-tables.scss',
})
export class ChartTables {
  readonly chart = input.required<ChartResponse>();
  readonly only = input<View | null>(null);

  private readonly chosen = signal<View>('planets');

  /** Doğum saati bilinmiyorsa ev yoktur */
  readonly hasHouses = computed(() => this.chart().houses.length > 0);

  /** Evler seçili ama haritada ev yoksa Gezegenler'e dönülür */
  readonly view = computed<View>(() => {
    const wanted = this.only() ?? this.chosen();
    return wanted === 'houses' && !this.hasHouses() ? 'planets' : wanted;
  });

  /** "sun" -> "Güneş" (açılar gezegenleri anahtarla verir) */
  readonly planetNames = computed(() => new Map(this.chart().planets.map((p) => [p.key, p.name])));

  setView(view: View): void {
    this.chosen.set(view);
  }
}