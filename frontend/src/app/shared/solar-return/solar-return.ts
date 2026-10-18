import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap } from 'rxjs';

import { SOLAR_ASCENDANT_TEXTS } from '../../core/content/solar-return-texts/ascendant';
import { SolarReturnKey } from '../../core/content/solar-return-texts/meanings';
import { SOLAR_MOON_TEXTS } from '../../core/content/solar-return-texts/moon';
import { SOLAR_SUN_HOUSE_TEXTS } from '../../core/content/solar-return-texts/sun-house';
import { getErrorMessage } from '../../core/http/error-message';
import { ChartCalculateRequest } from '../../core/models/chart';
import { Interpretation } from '../../core/models/interpretation';
import { Place } from '../../core/models/place';
import { SolarReturnRequest, SolarReturnResponse } from '../../core/models/solar-return';
import { ChartService } from '../../core/services/chart.service';
import { PlacesService } from '../../core/services/places.service';
import { SolarReturnInterpretationService } from '../../core/services/solar-return-interpretation.service';
import { ChartTables } from '../chart-tables/chart-tables';
import { ChartWheel } from '../chart-wheel/chart-wheel';
import { InterpretationPanel } from '../interpretation-panel/interpretation-panel';
import { SolarReturnYear } from '../solar-return-year/solar-return-year';

/** Backend'in desteklediği son yıl (backend: ephemeris.py MAX_YEAR) */
const MAX_YEAR = 2398;
/** Bugünden en fazla kaç yıl ilerisine bakılabilir */
const YEARS_AHEAD = 30;
/** Seçili gezegen panelinde en fazla kaç açı gösterilir */
const MAX_PANEL_ASPECTS = 5;
/** "Öne Çıkan Göstergeler" kutusunda en fazla kaç açı gösterilir */
const MAX_HIGHLIGHTS = 5;

const HARMONIOUS = new Set(['trine', 'sextile']);
const HARD = new Set(['square', 'opposition']);

// \uFE0E: sembolün renkli emoji yerine düz yazı olarak çizilmesini sağlar
const VS = '\uFE0E';
const SIGN_GLYPHS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

type PlaceMode = 'birth' | 'other';
type SubTab = 'overview' | 'planets' | 'houses' | 'aspects';
type AspectKind = 'harmonious' | 'hard' | 'neutral';

/** Seçili gezegen panelindeki bir açı satırı */
interface PanelAspect {
  other: string; // karşıdaki gezegenin adı
  type: string; // "Üçgen"
  orb: string; // "1.4"
  kind: AspectKind;
}

/** "Öne Çıkan Göstergeler" kutusundaki bir satır */
interface Highlight {
  first: string; // tıklanınca seçilecek gezegenin anahtarı
  title: string; // "Güneş – Plüton"
  subtitle: string; // "4. evde kavuşum" ya da "Kare · 1.4°"
  kind: AspectKind;
}

/** Metnin ilk cümlesi (kartlardaki kısa açıklama için) */
function firstSentence(text: string | undefined): string {
  if (!text) {
    return '';
  }
  const end = text.indexOf('. ');
  return end === -1 ? text : text.slice(0, end + 1);
}

function aspectKind(typeKey: string): AspectKind {
  return HARMONIOUS.has(typeKey) ? 'harmonious' : HARD.has(typeKey) ? 'hard' : 'neutral';
}

/**
 * Solar Return sekmesi: seçilen yılın Güneş dönüşü haritası.
 * Yıl ◀ ▶ ile değişir; harita doğum yerine ya da bulunulan başka bir yere göre çıkarılır.
 */
@Component({
  selector: 'app-solar-return',
  imports: [ChartWheel, ChartTables, InterpretationPanel, SolarReturnYear],
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

  // ---------- Kartlardaki kısa açıklamalar (yorum metinlerinin ilk cümlesi) ----------
  readonly ascendantTeaser = computed(() => {
    const asc = this.chart()?.ascendant;
    return asc ? firstSentence(SOLAR_ASCENDANT_TEXTS[asc.sign.key]) : '';
  });

  readonly sunTeaser = computed(() => {
    const house = this.sun()?.house;
    return house ? firstSentence(SOLAR_SUN_HOUSE_TEXTS[house]) : '';
  });

  readonly moonTeaser = computed(() => {
    const moon = this.moon();
    return moon ? firstSentence(SOLAR_MOON_TEXTS[moon.sign.key]) : '';
  });

  /** Burç anahtarından ("aries") burç sembolü (♈) */
  signGlyph(key: string | undefined): string {
    return key && SIGN_GLYPHS[key] ? SIGN_GLYPHS[key] + VS : '';
  }

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

  /** Haritanın en dar (en belirgin) açıları: "Öne Çıkan Göstergeler" */
  readonly highlights = computed<Highlight[]>(() => {
    const chart = this.chart();
    if (!chart) {
      return [];
    }
    const planets = new Map(chart.planets.map((p) => [p.key, p]));
    return [...chart.aspects]
      .sort((a, b) => a.orb - b.orb)
      .slice(0, MAX_HIGHLIGHTS)
      .map((a) => {
        const first = planets.get(a.first);
        const second = planets.get(a.second);
        const house = first?.house ?? null;
        const subtitle =
          a.type.key === 'conjunction' && house
            ? `${house}. evde kavuşum`
            : `${a.type.name} · ${a.orb.toFixed(1)}°`;
        return {
          first: a.first,
          title: `${first?.name ?? ''} – ${second?.name ?? ''}`,
          subtitle,
          kind: aspectKind(a.type.key),
        };
      });
  });

  // ---------- Açık olan açıklama ----------
  readonly selected = signal<Interpretation | null>(null);

  /** Haritanın hesaplandığı yerin adı */
  readonly placeLabel = computed(() =>
    this.mode() === 'birth' ? this.birthPlaceName() : (this.otherPlace()?.name ?? ''),
  );

  /** Güneş dönüşü anı, o yerin yerel saatine kaydırılmış (UTC olarak biçimlendirilmeli) */
  private readonly localMoment = computed(() => {
    const chart = this.chart();
    if (!chart) {
      return null;
    }
    return new Date(new Date(chart.utc_datetime).getTime() + chart.utc_offset_hours * 3_600_000);
  });

  /** "26 Ocak 2027" */
  readonly momentDate = computed(() => {
    const moment = this.localMoment();
    if (!moment) {
      return '';
    }
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(moment);
  });

  /** "23:22" */
  readonly momentClock = computed(() => {
    const moment = this.localMoment();
    if (!moment) {
      return '';
    }
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC',
    }).format(moment);
  });

  /** "UTC+3" */
  readonly offsetText = computed(() => {
    const offset = this.chart()?.utc_offset_hours ?? 0;
    return `UTC${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`;
  });

  /** "36.8969° K, 30.7133° D" (haritanın hesaplandığı yer) */
  readonly coordsText = computed(() => {
    const base = this.request();
    const other = this.otherPlace();
    const lat = this.mode() === 'birth' ? base.latitude : (other?.latitude ?? base.latitude);
    const lng = this.mode() === 'birth' ? base.longitude : (other?.longitude ?? base.longitude);
    return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'K' : 'G'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'D' : 'B'}`;
  });

  /** Hesaplama Bilgileri kutusunun satırları */
  readonly infoRows = computed(() => {
    const chart = this.chart();
    if (!chart) {
      return [];
    }
    const base = this.request();
    const birthDate = new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${base.birth_date}T00:00:00Z`));

    return [
      { label: 'Doğum tarihi', value: birthDate },
      { label: 'Doğum saati', value: base.birth_time ?? 'Bilinmiyor' },
      { label: 'Doğum yeri', value: this.birthPlaceName() },
      { label: 'Solar Return yılı', value: String(this.year()) },
      { label: 'Dönüş konumu', value: this.placeLabel() },
      {
        label: 'Dönüş anı',
        value: `${this.momentDate()} ${this.momentClock()} (${this.offsetText()})`,
      },
      { label: 'Koordinatlar', value: this.coordsText() },
      { label: 'Zodyak sistemi', value: 'Tropikal' },
      { label: 'Ev sistemi', value: chart.house_system?.name ?? '—' },
      { label: 'Efemeris', value: 'Swiss Ephemeris' },
    ];
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
          this.selectedPlanetKey.set(null);
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

  // ================= Alt sekmeler ve gezegen =================

  setSubTab(tab: SubTab): void {
    this.chosenSubTab.set(tab);
  }

  /** Çarkta (ya da göstergelerde) bir gezegene tıklanınca yandaki panel o gezegeni gösterir */
  selectPlanet(key: string): void {
    this.selectedPlanetKey.set(key);
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