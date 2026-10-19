import { Component, computed, inject, input } from '@angular/core';

import { ChartResponse } from '../../core/models/chart';
import { ProgressReadingService } from '../../core/services/progress-reading.service';

// \uFE0E: sembolün renkli emoji yerine düz yazı olarak çizilmesini sağlar
const VS = '\uFE0E';
const AREA_ICONS: Record<string, string> = {
  love: '♡' + VS,
  career: '✎' + VS,
  money: '◈' + VS,
  home: '⌂' + VS,
  growth: '✧' + VS,
};

/** Progress sekmesinin üstündeki "Yaş Yorumları": ana tema kutusu + alan kartları */
@Component({
  selector: 'app-progress-reading',
  templateUrl: './progress-reading.html',
  styleUrl: './progress-reading.scss',
})
export class ProgressReading {
  private readonly service = inject(ProgressReadingService);

  readonly chart = input.required<ChartResponse>();
  /** Seçili yaş; geçersiz tarihte null */
  readonly age = input<number | null>(null);

  private readonly areas = computed(() => this.service.areas(this.chart()));

  /** Genel Tema (büyük kutu) */
  readonly theme = computed(() => this.areas().find((a) => a.key === 'theme') ?? null);

  /** Etiketler: "Güneş · 4. ev", "Ay · 3. ev" */
  readonly tags = computed(() => this.theme()?.subtitle.split(', ').filter(Boolean) ?? []);

  /** Diğer alan kartları */
  readonly cards = computed(() =>
    this.areas()
      .filter((a) => a.key !== 'theme')
      .map((a) => ({ ...a, icon: AREA_ICONS[a.key] ?? '' })),
  );

  readonly title = computed(() => {
    const age = this.age();
    return age === null ? 'Bu Yaşta Öne Çıkanlar' : `${age} Yaşında Öne Çıkanlar`;
  });
}