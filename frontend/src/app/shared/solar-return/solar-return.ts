import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';

import { SolarReturnKey } from '../../core/content/solar-return-texts/meanings';
import { getErrorMessage } from '../../core/http/error-message';
import { ChartCalculateRequest } from '../../core/models/chart';
import { Interpretation } from '../../core/models/interpretation';
import { Place } from '../../core/models/place';
import { SolarReturnRequest, SolarReturnResponse } from '../../core/models/solar-return';
import { ChartService } from '../../core/services/chart.service';
import { PlacesService } from '../../core/services/places.service';
import { SolarReturnInterpretationService } from '../../core/services/solar-return-interpretation.service';
import { ChartWheel } from '../chart-wheel/chart-wheel';
import { InterpretationPanel } from '../interpretation-panel/interpretation-panel';

/** Backend'in desteklediği son yıl (backend: ephemeris.py MAX_YEAR) */
const MAX_YEAR = 2398;
/** Bugünden en fazla kaç yıl ilerisine bakılabilir */
const YEARS_AHEAD = 30;

type PlaceMode = 'birth' | 'other';

/**
 * Solar Return sekmesi: seçilen yılın Güneş dönüşü haritası.
 * Yıl ◀ ▶ ile değişir; harita doğum yerine ya da bulunulan başka bir yere göre çıkarılır.
 */
@Component({
  selector: 'app-solar-return',
  imports: [ChartWheel, InterpretationPanel],
  templateUrl: './solar-return.html',
  styleUrl: './solar-return.scss',
})
export class SolarReturn {
  private readonly chartService = inject(ChartService);
  private readonly placesService = inject(PlacesService);
  private readonly interpretations = inject(SolarReturnInterpretationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Doğum bilgileri (doğum haritasını hesaplayan istekle aynı) */
  readonly request = input.required<ChartCalculateRequest>();
  readonly birthPlaceName = input.required<string>();

  // ---------- Yıl ----------
  private readonly currentYear = new Date().getFullYear();
  private readonly chosenYear = signal<number | null>(null);

  readonly minYear = computed(() => Number(this.request().birth_date.slice(0, 4)) + 1);
  readonly maxYear = Math.min(this.currentYear + YEARS_AHEAD, MAX_YEAR);
  readonly year = computed(() =>
    Math.min(Math.max(this.chosenYear() ?? this.currentYear, this.minYear()), this.maxYear),
  );
  readonly canPrev = computed(() => this.year() > this.minYear());
  readonly canNext = computed(() => this.year() < this.maxYear);

  // ---------- Yer ----------
  readonly mode = signal<PlaceMode>('birth');
  readonly otherPlace = signal<Place | null>(null);
  readonly query = signal('');
  readonly results = signal<Place[] | null>(null); // null = liste kapalı
  readonly searching = signal(false);
  readonly searchError = signal<string | null>(null);

  // ---------- Sonuç ----------
  readonly result = signal<SolarReturnResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly chart = computed(() => this.result()?.chart ?? null);
  readonly sun = computed(() => this.chart()?.planets.find((p) => p.key === 'sun') ?? null);
  readonly moon = computed(() => this.chart()?.planets.find((p) => p.key === 'moon') ?? null);

  // ---------- Açık olan açıklama ----------
  readonly selected = signal<Interpretation | null>(null);

  /** Haritanın hesaplandığı yerin adı */
  readonly placeLabel = computed(() =>
    this.mode() === 'birth' ? this.birthPlaceName() : (this.otherPlace()?.name ?? ''),
  );

  /** "15 Haziran 2026, 08:42" (o yerin yerel saatiyle) */
  readonly momentText = computed(() => {
    const chart = this.chart();
    if (!chart) {
      return '';
    }
    const utcMs = new Date(chart.utc_datetime).getTime();
    const local = new Date(utcMs + chart.utc_offset_hours * 3_600_000);
    // UTC olarak biçimlendirilir: kaydırma yukarıda elle yapıldı, tarayıcı dilimi karışmasın
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(local);
  });

  /** Backend'e gidecek istek; "başka yer" seçili ama yer seçilmemişse null */
  private readonly params = computed<SolarReturnRequest | null>(() => {
    const base = this.request();
    const year = this.year();
    if (this.mode() === 'birth') {
      return { ...base, year };
    }
    const place = this.otherPlace();
    if (!place) {
      return null;
    }
    return { ...base, year, return_latitude: place.latitude, return_longitude: place.longitude };
  });

  constructor() {
    // İstek değişince (yıl, yer, doğum bilgisi) eskisi iptal edilir, yenisi atılır
    toObservable(this.params)
      .pipe(
        switchMap((params) => {
          this.result.set(null);
          this.error.set(null);
          this.selected.set(null); // yeni harita gelirken eski açıklama kapansın
          if (!params) {
            this.loading.set(false);
            return EMPTY;
          }
          this.loading.set(true);
          return this.chartService.solarReturn(params).pipe(
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

  // ================= Yorumlar =================

  /** Yükselen, Güneş'in evi ya da Ay kartı tıklanınca; aynı karta tekrar basılırsa kapanır */
  select(key: SolarReturnKey): void {
    const id = `solar-${key}`;
    if (this.selected()?.id === id) {
      this.selected.set(null);
      return;
    }

    const chart = this.chart();
    const sun = this.sun();
    const moon = this.moon();
    let detail: Interpretation | null = null;
    if (key === 'ascendant' && chart?.ascendant) {
      detail = this.interpretations.forAscendant(chart.ascendant);
    } else if (key === 'sun' && sun) {
      detail = this.interpretations.forSun(sun);
    } else if (key === 'moon' && moon) {
      detail = this.interpretations.forMoon(moon);
    }
    this.selected.set(detail);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  // ================= Yıl =================

  shiftYear(delta: number): void {
    this.chosenYear.set(Math.min(Math.max(this.year() + delta, this.minYear()), this.maxYear));
  }

  // ================= Yer =================

  setMode(mode: PlaceMode): void {
    this.mode.set(mode);
  }

  onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /** Sadece kullanıcı "Ara"ya ya da Enter'a basınca çağrılır (Nominatim kuralı) */
  searchPlaces(): void {
    const text = this.query().trim();
    if (text.length < 2 || this.searching()) {
      return;
    }
    this.searching.set(true);
    this.searchError.set(null);
    this.results.set(null);

    this.placesService
      .search(text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (places) => {
          this.results.set(places);
          this.searching.set(false);
        },
        error: (error) => {
          this.searchError.set(getErrorMessage(error));
          this.searching.set(false);
        },
      });
  }

  choosePlace(place: Place): void {
    this.otherPlace.set(place);
    this.query.set(place.display_name);
    this.results.set(null);
  }
}