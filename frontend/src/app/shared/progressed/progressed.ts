import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';

import { getErrorMessage } from '../../core/http/error-message';
import { ChartCalculateRequest, ChartResponse } from '../../core/models/chart';
import { ProgressedRequest, ProgressedResponse } from '../../core/models/progressed';
import { ChartService } from '../../core/services/chart.service';
import { ChartWheel } from '../chart-wheel/chart-wheel';

/** Backend'in desteklediği son tarih (backend: ephemeris.py MAX_YEAR) */
const MAX_DATE = '2398-12-31';
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Tabloda doğum ve ilerletilmiş konumları karşılaştırılan gök cisimleri (hızlı ilerleyenler) */
const TABLE_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars'];

/** Bugünün yerel tarihi, "2026-10-18" biçiminde */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "1995-06-15" -> "1995-06-16" */
function nextDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/** Tarihi yıl kadar kaydırır (29 Şubat artık olmayan yılda 1 Mart olur) */
function shiftYears(iso: string, delta: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + delta);
  return date.toISOString().slice(0, 10);
}

/** Tabloda bir satır: gök cisminin doğumdaki ve ilerletilmiş konumu */
interface Row {
  name: string;
  natal: string;
  progressed: string;
  changed: boolean; // ilerletilmiş konum doğumdakinden farklı burçta mı
  retrograde: boolean;
}

/**
 * İlerletilmiş harita sekmesi ("bir gün = bir yıl").
 * Seçilen tarihte doğum haritası iç halkada, ilerletilmiş gezegenler dış halkada gösterilir.
 */
@Component({
  selector: 'app-progressed',
  imports: [ChartWheel],
  templateUrl: './progressed.html',
  styleUrl: './progressed.scss',
})
export class Progressed {
  private readonly chartService = inject(ChartService);

  /** Doğum bilgileri (doğum haritasını hesaplayan istekle aynı) */
  readonly request = input.required<ChartCalculateRequest>();
  /** Doğum haritası: çarkın iç halkası ve tablodaki "Doğumda" sütunu */
  readonly natal = input.required<ChartResponse>();

  // ---------- Tarih ----------
  readonly minDate = computed(() => nextDay(this.request().birth_date));
  readonly maxDate = MAX_DATE;
  readonly targetDate = signal(todayIso());

  /** Tarih geçersizse kullanıcıya gösterilecek açıklama (geçerliyse null) */
  readonly dateError = computed(() => {
    const date = this.targetDate();
    if (!ISO_PATTERN.test(date)) {
      return 'Bir tarih seç.';
    }
    if (date < this.minDate()) {
      return 'Tarih doğum tarihinden sonra olmalı.';
    }
    if (date > this.maxDate) {
      return 'Tarih 2398 yılından sonra olamaz.';
    }
    return null;
  });

  // ---------- Sonuç ----------
  readonly result = signal<ProgressedResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly chart = computed(() => this.result()?.chart ?? null);

  /** "31 yaş 3 ay" */
  readonly ageText = computed(() => {
    const result = this.result();
    if (!result) {
      return '';
    }
    const years = Math.floor(result.age_years);
    const months = Math.floor((result.age_years - years) * 12);
    return `${years} yaş ${months} ay`;
  });

  /** Doğum ve ilerletilmiş konumların yan yana tablosu */
  readonly rows = computed<Row[]>(() => {
    const progressed = this.chart();
    if (!progressed) {
      return [];
    }
    const natal = this.natal();

    const planetRows = TABLE_PLANETS.flatMap((key) => {
      const before = natal.planets.find((p) => p.key === key);
      const after = progressed.planets.find((p) => p.key === key);
      if (!before || !after) {
        return [];
      }
      return [
        {
          name: before.name,
          natal: before.formatted,
          progressed: after.formatted,
          changed: before.sign.key !== after.sign.key,
          retrograde: after.retrograde,
        },
      ];
    });

    // Yükselen sadece doğum saati biliniyorsa vardır
    if (natal.ascendant && progressed.ascendant) {
      planetRows.push({
        name: 'Yükselen',
        natal: natal.ascendant.formatted,
        progressed: progressed.ascendant.formatted,
        changed: natal.ascendant.sign.key !== progressed.ascendant.sign.key,
        retrograde: false,
      });
    }
    return planetRows;
  });

  /** İlerletilmiş Ay'ın şimdiki burcu ve bir sonraki burç değişimi */
  readonly moonInfo = computed(() => {
    const result = this.result();
    const moon = result?.chart.planets.find((p) => p.key === 'moon');
    if (!result || !moon) {
      return null;
    }
    return {
      current: moon.sign.name,
      next: result.next_moon_sign_change.sign.name,
      date: this.formatDate(result.next_moon_sign_change.change_date),
    };
  });

  /** Backend'e gidecek istek; tarih geçersizse null (boşuna istek atılmaz) */
  private readonly params = computed<ProgressedRequest | null>(() =>
    this.dateError() === null ? { ...this.request(), target_date: this.targetDate() } : null,
  );

  constructor() {
    // İstek değişince (tarih, doğum bilgisi) eskisi iptal edilir, yenisi atılır
    toObservable(this.params)
      .pipe(
        switchMap((params) => {
          this.result.set(null);
          this.error.set(null);
          if (!params) {
            this.loading.set(false);
            return EMPTY;
          }
          this.loading.set(true);
          return this.chartService.progressed(params).pipe(
            catchError((error) => {
              this.error.set(getErrorMessage(error));
              this.loading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.result.set(response);
        this.loading.set(false);
      });
  }

  // ================= Tarih =================

  onDateInput(event: Event): void {
    this.setDate((event.target as HTMLInputElement).value);
  }

  setDate(value: string): void {
    this.targetDate.set(value);
  }

  setToday(): void {
    const today = todayIso();
    this.setDate(today < this.minDate() ? this.minDate() : today);
  }

  /** Yıl okları: geçerli tarih yoksa bugünden başlar, sınırların dışına çıkmaz */
  shiftYear(delta: number): void {
    const base = this.dateError() === null ? this.targetDate() : todayIso();
    const shifted = shiftYears(base, delta);
    if (shifted > this.maxDate) {
      this.setDate(this.maxDate);
    } else if (shifted < this.minDate()) {
      this.setDate(this.minDate());
    } else {
      this.setDate(shifted);
    }
  }

  /** "2027-03-02" -> "2 Mart 2027" */
  private formatDate(isoDate: string): string {
    // UTC olarak okunur: yoksa bazı saat dilimlerinde bir gün önceki tarih gösterilebilir
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00Z`));
  }
}