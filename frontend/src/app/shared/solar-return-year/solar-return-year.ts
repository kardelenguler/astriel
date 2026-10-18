import { Component, computed, inject, input } from '@angular/core';

import { ChartResponse } from '../../core/models/chart';
import { SolarReturnYearService } from '../../core/services/solar-return-year.service';

/**
 * Solar Return yıl yorumu: "Yılın Ana Teması" kutusu (only="theme")
 * ya da yaşam alanı yorumları (only="areas").
 */
@Component({
  selector: 'app-solar-return-year',
  templateUrl: './solar-return-year.html',
  styleUrl: './solar-return-year.scss',
})
export class SolarReturnYear {
  private readonly service = inject(SolarReturnYearService);

  readonly chart = input.required<ChartResponse>();
  readonly only = input.required<'theme' | 'areas'>();

  readonly theme = computed(() => this.service.theme(this.chart()));
  readonly areas = computed(() => this.service.areas(this.chart()));
}