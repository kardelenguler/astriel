import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';

import {
  PROGRESS_ASC_TEXTS,
  PROGRESS_MOON_TEXTS,
  PROGRESS_SUN_TEXTS,
} from '../../core/content/progress-texts/cards';
import { getErrorMessage } from '../../core/http/error-message';
import { ChartCalculateRequest, ChartResponse } from '../../core/models/chart';
import { ProgressedRequest, ProgressedResponse } from '../../core/models/progressed';
import { ChartService } from '../../core/services/chart.service';
import { ChartTables } from '../chart-tables/chart-tables';
import { ChartWheel } from '../chart-wheel/chart-wheel';

/** Backend'in desteklediği son tarih (backend: ephemeris.py MAX_YEAR) */
const MAX_DATE = '2398-12-31';
/** Yaş çubuğunun en fazla gösterdiği yaş */
const MAX_AGE = 100;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Tabloda doğum ve progress konumları karşılaştırılan gök cisimleri (hızlı ilerleyenler) */
const TABLE_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars'];
/** "Progress Gezegenleri" listesinde gösterilen gezegenler */
const LIST_PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];
/** Seçili gezegen panelinde en fazla kaç açı gösterilir */
const MAX_PANEL_ASPECTS = 5;

const HARMONIOUS = new Set(['trine', 'sextile']);
const HARD = new Set(['square', 'opposition']);

// \uFE0E: sembolün renkli emoji yerine düz yazı olarak çizilmesini sağlar
const VS = '\uFE0E';
const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

type PickMode = 'age' | 'date';
type SubTab = 'overview' | 'planets' | 'houses' | 'aspects';
type AspectKind = 'harmonious' | 'hard' | 'neutral';

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

/** Tarihi yıl kadar kaydırır (29 Şubat olmayan yılda 1 Mart olur) */
function shiftYears(iso: string, delta: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + delta);
  return date.toISOString().slice(0, 10);
}

/** İki tarih arasındaki tamamlanmış yıl sayısı (yaş) */
function fullYears(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  let years = toYear - fromYear;
  if (toMonth < fromMonth || (toMonth === fromMonth && toDay < fromDay)) {
    years--;
  }
  return years;
}

function aspectKind(typeKey: string): AspectKind {
  return HARMONIOUS.has(typeKey) ? 'harmonious' : HARD.has(typeKey) ? 'hard' : 'neutral';
}

/** Tabloda bir satır: gök cisminin doğumdaki ve progress konumu */
interface Row {
  name: string;
  natal: string;
  progressed: string;
  changed: boolean; // progress konumu doğumdakinden farklı burçta mı
  retrograde: boolean;
}

/** Üstteki kartlardan biri: Progress Ay, Güneş ya da Yükselen */
interface TopCard {
  key: 'moon' | 'sun' | 'asc';
  label: string; // "Progress Ay"
  icon: string;
  sign: string; // "Terazi"
  detail: string; // "14°32' Terazi"
  house: number | null;
  teaser: string; // kısa açıklama
}

/** Seçili gezegen panelindeki bir açı satırı */
interface PanelAspect {
  other: string; // karşıdaki gezegenin adı
  type: string; // "Üçgen"
  orb: string; // "1.4"
  kind: AspectKind;
}

/** "Progress Gezegenleri" listesindeki bir satır */
interface ListedPlanet {
  key: string;
  name: string;
  glyph: string;
  label: string; // "6°48' Kova"
  house: number | null;
}

/**
 * Progress sekmesi ("bir gün = bir yıl").
 * Seçilen yaşta doğum haritası iç halkada, progress gezegenleri dış halkada gösterilir.
 */
@Component({
  selector: 'app-progressed',
  imports: [ChartWheel, ChartTables],
  templateUrl: './progressed.html',
  styleUrl: './progressed.scss',
})
export class Progressed {
  private readonly chartService = inject(ChartService);

  /** Doğum bilgileri (doğum haritasını hesaplayan istekle aynı) */
  readonly request = input.required<ChartCalculateRequest>();
  /** Doğum haritası: çarkın iç halkası ve tablodaki "Doğumda" sütunu */
  readonly natal = input.required<ChartResponse>();

  // ---------- Zaman seçici ----------
  readonly pickMode = signal<PickMode>('age');
  readonly minDate = computed(() => nextDay(this.request().birth_date));
  readonly maxDate = MAX_DATE;
  readonly targetDate = signal(todayIso());

  /** Yaş çubuğunun en büyük değeri */
  readonly maxAge = computed(() =>
    Math.min(MAX_AGE, Number(MAX_DATE.slice(0, 4)) - Number(this.request().birth_date.slice(0, 4))),
  );

  /** Seçili tarihteki yaş (tamamlanmış yıl); tarih geçersizse null */
  readonly age = computed(() => {
    const date = this.targetDate();
    if (!ISO_PATTERN.test(date)) {
      return null;
    }
    return Math.max(fullYears(this.request().birth_date, date), 0);
  });

  /** Çubuğun gösterdiği yaş: her zaman 1 ile en büyük yaş arasında */
  readonly sliderAge = computed(() => Math.min(Math.max(this.age() ?? 1, 1), this.maxAge()));

  /** "26 Ocak 2027" (tarih geçersizse boş) */
  readonly dateText = computed(() =>
    this.dateError() === null ? this.formatDate(this.targetDate()) : '',
  );

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

  // ---------- Alt sekmeler ----------
  private readonly chosenSubTab = signal<SubTab>('overview');
  readonly hasHouses = computed(() => (this.chart()?.houses.length ?? 0) > 0);
  /** Evler seçili ama haritada ev yoksa Genel Bakış'a dönülür */
  readonly subTab = computed<SubTab>(() =>
    this.chosenSubTab() === 'houses' && !this.hasHouses() ? 'overview' : this.chosenSubTab(),
  );

  // ---------- Seçili gezegen (çarkta tıklanan; seçilmediyse Güneş) ----------
  private readonly selectedPlanetKey = signal<string | null>(null);

  readonly selectedPlanet = computed(() => {
    const planets = this.chart()?.planets ?? [];
    const key = this.selectedPlanetKey() ?? 'sun';
    return planets.find((p) => p.key === key) ?? null;
  });

  /** Seçili gezegenin en dar (en güçlü) açıları */
  readonly planetAspects = computed<PanelAspect[]>(() => {
    const chart = this.chart();
    const planet = this.selectedPlanet();
    if (!chart || !planet) {
      return [];
    }
    const names = new Map(chart.planets.map((p) => [p.key, p.name]));
    return chart.aspects
      .filter((a) => a.first === planet.key || a.second === planet.key)
      .sort((a, b) => a.orb - b.orb)
      .slice(0, MAX_PANEL_ASPECTS)
      .map((a) => ({
        other: names.get(a.first === planet.key ? a.second : a.first) ?? '',
        type: a.type.name,
        orb: a.orb.toFixed(1),
        kind: aspectKind(a.type.key),
      }));
  });

  /** "Progress Gezegenleri" listesi */
  readonly planetList = computed<ListedPlanet[]>(() => {
    const chart = this.chart();
    if (!chart) {
      return [];
    }
    return LIST_PLANETS.flatMap((key) => {
      const planet = chart.planets.find((p) => p.key === key);
      if (!planet) {
        return [];
      }
      return [
        {
          key,
          name: planet.name,
          glyph: (PLANET_GLYPHS[key] ?? '') + VS,
          label: planet.formatted,
          house: planet.house,
        },
      ];
    });
  });

  /** "Progress Bilgileri" kutusunun satırları */
  readonly infoRows = computed(() => {
    const result = this.result();
    if (!result) {
      return [];
    }
    const base = this.request();
    const progressedMs =
      new Date(`${base.birth_date}T00:00:00Z`).getTime() + result.age_years * DAY_MS;
    const progressedDate = new Date(progressedMs).toISOString().slice(0, 10);

    return [
      { label: 'Doğum tarihi', value: this.formatDate(base.birth_date) },
      { label: 'Doğum saati', value: base.birth_time ?? 'Bilinmiyor' },
      { label: 'Seçilen yaş', value: String(this.age() ?? '—') },
      { label: 'Karşılık gelen tarih', value: this.dateText() },
      { label: 'Progress zamanı', value: this.formatDate(progressedDate) },
      { label: 'Zodyak sistemi', value: 'Tropikal' },
      { label: 'Ev sistemi', value: result.chart.house_system?.name ?? '—' },
      { label: 'Efemeris', value: 'Swiss Ephemeris' },
    ];
  });

  /** Üstteki kartlar: Progress Ay, Güneş, Yükselen */
  readonly cards = computed<TopCard[]>(() => {
    const chart = this.chart();
    if (!chart) {
      return [];
    }
    const cards: TopCard[] = [];

    const moon = chart.planets.find((p) => p.key === 'moon');
    if (moon) {
      cards.push({
        key: 'moon',
        label: 'Progress Ay',
        icon: '☽' + VS,
        sign: moon.sign.name,
        detail: moon.formatted,
        house: moon.house,
        teaser: PROGRESS_MOON_TEXTS[moon.sign.key] ?? '',
      });
    }

    const sun = chart.planets.find((p) => p.key === 'sun');
    if (sun) {
      cards.push({
        key: 'sun',
        label: 'Progress Güneş',
        icon: '☉' + VS,
        sign: sun.sign.name,
        detail: sun.formatted,
        house: sun.house,
        teaser: PROGRESS_SUN_TEXTS[sun.sign.key] ?? '',
      });
    }

    // Yükselen sadece doğum saati biliniyorsa vardır
    if (chart.ascendant) {
      cards.push({
        key: 'asc',
        label: 'Progress Yükselen',
        icon: '↗' + VS,
        sign: chart.ascendant.sign.name,
        detail: chart.ascendant.formatted,
        house: 1,
        teaser: PROGRESS_ASC_TEXTS[chart.ascendant.sign.key] ?? '',
      });
    }
    return cards;
  });

  /** Doğum ve progress konumların yan yana tablosu */
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

  /** Progress Ay'ın şimdiki burcu ve bir sonraki burç değişimi */
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
          this.selectedPlanetKey.set(null);
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

  // ================= Alt sekmeler ve gezegen =================

  setSubTab(tab: SubTab): void {
    this.chosenSubTab.set(tab);
  }

  /** Çarkta (ya da listede) bir gezegene tıklanınca yandaki panel o gezegeni gösterir */
  selectPlanet(key: string): void {
    this.selectedPlanetKey.set(key);
  }

  // ================= Zaman seçici =================

  setPickMode(mode: PickMode): void {
    this.pickMode.set(mode);
  }

  /** Yaş çubuğu: seçilen yaşın doğum günü tarihi hesaplanır */
  onAgeInput(event: Event): void {
    this.setAge(Number((event.target as HTMLInputElement).value));
  }

  setAge(age: number): void {
    const clamped = Math.min(Math.max(Math.round(age) || 1, 1), this.maxAge());
    this.setDate(shiftYears(this.request().birth_date, clamped));
  }

  /** −/+ düğmeleri: bir yaş geri/ileri */
  shiftAge(delta: number): void {
    this.setAge(this.sliderAge() + delta);
  }

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