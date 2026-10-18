import { Component, computed, input } from '@angular/core';

import { buildSpecialPointCards } from '../../core/content/special-point-cards';
import { ChartResponse } from '../../core/models/chart';

/**
 * Harita sayfasındaki "Özel Noktalar" bölümü.
 * Hangi kartların çıkacağına buildSpecialPointCards karar verir
 * (doğum saati yoksa Şans Noktası kilitli kart olarak görünür).
 */
@Component({
  selector: 'app-special-points',
  templateUrl: './special-points.html',
  styleUrl: './special-points.scss',
})
export class SpecialPoints {
  readonly chart = input.required<ChartResponse>();
  protected readonly cards = computed(() => buildSpecialPointCards(this.chart()));
}