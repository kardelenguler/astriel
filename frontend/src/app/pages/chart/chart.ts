import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

import { PointKey } from '../../core/content/points';
import { getErrorMessage } from '../../core/http/error-message';
import { ChartCalculateRequest, ChartResponse } from '../../core/models/chart';
import { Interpretation } from '../../core/models/interpretation';
import { AuthService } from '../../core/services/auth.service';
import { ChartService } from '../../core/services/chart.service';
import { InterpretationService } from '../../core/services/interpretation.service';
import { SavedChartsService } from '../../core/services/saved-charts.service';
import { ChartWheel } from '../../shared/chart-wheel/chart-wheel';
import { InterpretationPanel } from '../../shared/interpretation-panel/interpretation-panel';
import { SolarReturn } from '../../shared/solar-return/solar-return';
import { SpecialPoints } from '../../shared/special-points/special-points';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // 1995-06-15
const TIME_PATTERN = /^\d{2}:\d{2}$/; // 14:30
const NAME_MAX_LENGTH = 100; // backend'deki sınırın aynısı

// Kaydetme kutusunun durumları
type SaveState = 'idle' | 'editing' | 'saving' | 'saved';

// Sayfadaki sekmeler (ileride 'progressed' eklenecek)
type Tab = 'natal' | 'solar';

/**
 * Harita sonuç sayfası. İki şekilde açılır:
 * 1) /harita?tarih=...&saat=...&enlem=...&boylam=...&yer=...  -> bilgiler adresten okunur, harita hesaplanır
 * 2) /harita/<id>  -> kayıtlı harita veritabanından gelir, yeniden HESAPLANMAZ
 */
@Component({
  selector: 'app-chart',
  imports: [RouterLink, ChartWheel, InterpretationPanel, SpecialPoints, SolarReturn],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly chartService = inject(ChartService);
  private readonly savedCharts = inject(SavedChartsService);
  private readonly interpretations = inject(InterpretationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly auth = inject(AuthService);

  // ---------- Sayfanın durumu ----------
  readonly chart = signal<ChartResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly placeName = signal('');
  readonly birthDateText = signal(''); // "26 Ocak 2005"
  readonly birthTimeText = signal<string | null>(null); // "14:15" veya null
  readonly savedName = signal<string | null>(null); // kayıtlı haritanın adı (sadece /harita/<id>)
  readonly editParams = signal<Params>({}); // "Bilgileri değiştir" bağlantısı formu bu bilgilerle doldurur

  // ---------- Sekmeler ----------
  readonly tab = signal<Tab>('natal');
  /** Solar Return gibi sekmelerin kullandığı doğum bilgileri (hem adresten hem kayıtlıdan gelir) */
  readonly birthRequest = signal<ChartCalculateRequest | null>(null);

  // ---------- Kaydetme durumu ----------
  private request: ChartCalculateRequest | null = null; // kaydederken tekrar lazım
  readonly saveState = signal<SaveState>('idle');
  readonly saveName = signal('Benim haritam');
  readonly saveError = signal<string | null>(null);

  // ---------- Açık olan açıklama ----------
  readonly selected = signal<Interpretation | null>(null);
  readonly detailError = signal<string | null>(null);

  /** Büyük üçlüden biri seçiliyse onun açıklaması (kartların altında gösterilir) */
  readonly pointDetail = computed(() => {
    const detail = this.selected();
    return detail?.id.startsWith('point-') ? detail : null;
  });

  /** Evlerden biri seçiliyse onun açıklaması (ev kartlarının altında gösterilir) */
  readonly houseDetail = computed(() => {
    const detail = this.selected();
    return detail?.id.startsWith('house-') ? detail : null;
  });

  /** Tablodan bir gezegen seçiliyse onun açıklaması */
  readonly planetDetail = computed(() => {
    const detail = this.selected();
    return detail?.id.startsWith('planet-') ? detail : null;
  });

  // ---------- Hesaplanan değerler (chart değişince kendiliğinden güncellenir) ----------
  readonly sun = computed(() => this.chart()?.planets.find((p) => p.key === 'sun') ?? null);
  readonly moon = computed(() => this.chart()?.planets.find((p) => p.key === 'moon') ?? null);

  /** "sun" -> "Güneş" (açılar tablosu gezegenleri anahtarla verir) */
  readonly planetNames = computed(
    () => new Map(this.chart()?.planets.map((p) => [p.key, p.name]) ?? []),
  );

  constructor() {
    // Adres değişince (ör. tarayıcının geri/ileri düğmesi) haritayı yeniden yükle.
    // Adreste id varsa kayıtlı harita açılır, yoksa adresteki bilgilerle hesaplanır.
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([routeParams, queryParams]) => {
        const id = routeParams.get('id');
        if (id) {
          this.loadSaved(id);
        } else {
          this.load(queryParams);
        }
      });
  }

  // ================= Sekmeler =================

  setTab(tab: Tab): void {
    if (this.tab() === tab) {
      return;
    }
    this.closeDetail(); // başka sekmeye geçince açık açıklama kapansın
    this.tab.set(tab);
  }

  // ================= Yorumlar =================

  /** Güneş, Ay veya Yükselen kartı tıklanınca */
  selectPoint(key: PointKey): void {
    const placement =
      key === 'sun' ? this.sun() : key === 'moon' ? this.moon() : this.chart()?.ascendant;
    if (!placement) {
      return;
    }
    this.toggle(`point-${key}`, () => this.interpretations.forPoint(key, placement));
  }

  /** Ev kartı tıklanınca (houseNo: 1–12) */
  selectHouse(houseNo: number): void {
    const cusp = this.chart()?.houses[houseNo - 1];
    if (!cusp) {
      return;
    }
    this.toggle(`house-${houseNo}`, () => this.interpretations.forHouse(houseNo, cusp));
  }

  /** Tablodaki gezegen adı tıklanınca */
  selectPlanet(key: string): void {
    const planet = this.chart()?.planets.find((p) => p.key === key);
    if (!planet) {
      return;
    }
    this.toggle(`planet-${key}`, () => this.interpretations.forPlanet(planet));
  }

  /**
   * Çarktaki gezegen sembolüne tıklanınca: yorumu açar ve ekranı oraya kaydırır
   * (yorum, sayfada çarkın epey altındaki Gezegenler bölümünde açılır).
   */
  showPlanet(key: string): void {
    this.selectPlanet(key);
    if (!this.planetDetail()) {
      return; // yorum kapandı veya bulunamadı: kaydırmaya gerek yok
    }
    // Yorum paneli çizildikten sonra kaydır (aynı anda tek panel açık olabilir)
    afterNextRender(
      () => {
        this.host.nativeElement
          .querySelector('app-interpretation-panel')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      { injector: this.injector },
    );
  }

  closeDetail(): void {
    this.selected.set(null);
    this.detailError.set(null);
  }

  /** Aynı karta tekrar basılırsa kapat, başka karta basılırsa onu aç */
  private toggle(id: string, build: () => Interpretation | null): void {
    if (this.selected()?.id === id) {
      this.closeDetail();
      return;
    }
    const detail = build();
    if (!detail) {
      this.selected.set(null);
      this.detailError.set('Bu açıklama şu an gösterilemiyor.');
      console.warn('Yorum bulunamadı:', id);
      return;
    }
    this.detailError.set(null);
    this.selected.set(detail);
  }

  // ================= Kaydetme =================

  /** "Haritayı kaydet" düğmesi */
  startSave(): void {
    // isLoggedIn() yerine token'a bakılır: sayfa yeni açıldığında kullanıcı bilgisi
    // birkaç an sonra yüklenir; o arada "giriş yapmamış" sanılıp harita kaybolmasın.
    if (!this.auth.token) {
      this.goToLogin();
      return;
    }
    this.saveError.set(null);
    this.saveState.set('editing');
  }

  cancelSave(): void {
    this.saveError.set(null);
    this.saveState.set('idle');
  }

  onSaveNameInput(event: Event): void {
    this.saveName.set((event.target as HTMLInputElement).value);
    this.saveError.set(null);
  }

  saveChart(): void {
    if (this.saveState() === 'saving' || !this.request) {
      return; // çift tıklamada iki kez kaydedilmesin
    }

    const name = this.saveName().trim();
    if (!name) {
      this.saveError.set('Haritana bir ad ver.');
      return;
    }
    if (name.length > NAME_MAX_LENGTH) {
      this.saveError.set(`Ad en fazla ${NAME_MAX_LENGTH} karakter olabilir.`);
      return;
    }

    this.saveState.set('saving');
    this.saveError.set(null);

    this.savedCharts
      .save({
        ...this.request,
        name,
        place_name: (this.placeName().trim() || 'Bilinmeyen yer').slice(0, 200),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.saveState.set('saved'),
        error: (error) => {
          // Oturum süresi dolduysa (interceptor çıkış yaptırdı) giriş sayfasına git;
          // giriş yapınca bu haritaya geri dönülür, harita kaybolmaz.
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.goToLogin({ oturum: 'doldu' });
            return;
          }
          this.saveError.set(getErrorMessage(error));
          this.saveState.set('editing');
        },
      });
  }

  /** Giriş sayfasına gönderir; giriş yapınca bu haritaya geri dönülsün */
  private goToLogin(extra: Params = {}): void {
    this.router.navigate(['/giris'], { queryParams: { donus: this.router.url, ...extra } });
  }

  // ================= Hesaplama =================

  /** Başka bir haritaya geçilince kaydetme kutusu, açık açıklama ve sekme sıfırlansın */
  private resetPage(): void {
    this.saveState.set('idle');
    this.saveError.set(null);
    this.savedName.set(null);
    this.tab.set('natal');
    this.birthRequest.set(null);
    this.closeDetail();
  }

  /** /harita/<id>: kayıtlı haritayı veritabanındaki haliyle gösterir (yeniden hesaplamaz) */
  private loadSaved(id: string): void {
    this.resetPage();
    this.request = null; // zaten kayıtlı, tekrar kaydedilmez
    this.saveState.set('saved'); // "Kaydet" yerine "Kaydedildi ✓" görünsün

    this.loading.set(true);
    this.error.set(null);
    this.chart.set(null);

    this.savedCharts
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          const time = saved.birth_time?.slice(0, 5) ?? null; // "14:15:00" -> "14:15"
          this.savedName.set(saved.name);
          this.placeName.set(saved.place_name);
          this.birthDateText.set(this.formatDate(saved.birth_date));
          this.birthTimeText.set(time);
          this.editParams.set({
            tarih: saved.birth_date,
            saat: time ?? undefined,
            enlem: saved.latitude,
            boylam: saved.longitude,
            yer: saved.place_name,
          });
          this.birthRequest.set({
            birth_date: saved.birth_date,
            birth_time: time,
            latitude: saved.latitude,
            longitude: saved.longitude,
          });
          this.chart.set(saved.chart);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  private load(params: ParamMap): void {
    const request = this.parseParams(params);

    this.resetPage();
    this.request = request;

    if (!request) {
      this.error.set('Adresteki doğum bilgileri eksik veya hatalı. Ana sayfadan tekrar dene.');
      this.loading.set(false);
      return;
    }

    this.placeName.set(params.get('yer') ?? '');
    this.editParams.set(Object.fromEntries(params.keys.map((key) => [key, params.get(key)])));
    this.birthDateText.set(this.formatDate(request.birth_date));
    this.birthTimeText.set(request.birth_time);
    this.birthRequest.set(request);

    this.loading.set(true);
    this.error.set(null);
    this.chart.set(null);

    this.chartService
      .calculate(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (chart) => {
          this.chart.set(chart);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  /** Adresteki bilgileri kontrol eder; eksik/bozuksa null (backend'e boşuna istek atılmaz) */
  private parseParams(params: ParamMap): ChartCalculateRequest | null {
    const date = params.get('tarih');
    const time = params.get('saat'); // yoksa: saat bilinmiyor
    const latitude = Number(params.get('enlem'));
    const longitude = Number(params.get('boylam'));

    const dateOk = date !== null && DATE_PATTERN.test(date);
    const timeOk = time === null || TIME_PATTERN.test(time);
    const latitudeOk = params.has('enlem') && Number.isFinite(latitude) && Math.abs(latitude) <= 90;
    const longitudeOk = params.has('boylam') && Number.isFinite(longitude) && Math.abs(longitude) <= 180;

    if (!dateOk || !timeOk || !latitudeOk || !longitudeOk) {
      return null;
    }
    return { birth_date: date, birth_time: time, latitude, longitude };
  }

  /** "2005-01-26" -> "26 Ocak 2005" */
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