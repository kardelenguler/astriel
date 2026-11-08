import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { ChartList, ChartSummary, SavedChart } from '../../core/models/saved-chart';
import { SavedChartsService } from '../../core/services/saved-charts.service';
import { MyCharts } from './my-charts';

/** Testlerde kullanılan sahte harita kaydı */
function makeChart(no: number): ChartSummary {
  return {
    id: `id-${no}`,
    name: `Harita ${no}`,
    birth_date: '2005-01-26',
    birth_time: '14:15:00',
    place_name: 'Antalya',
    sun_sign: { key: 'aquarius', name: 'Kova', element: 'air', modality: 'fixed' },
    moon_sign: { key: 'leo', name: 'Aslan', element: 'fire', modality: 'fixed' },
    ascendant_sign: null,
    // Küçük numara daha yeni: id-1 en üstte (backend'deki "en yeni üstte" sıralaması)
    created_at: new Date(Date.UTC(2026, 9, 1) - no * 60_000).toISOString(),
  };
}

// Sunucuda TOTAL kadar harita varmış gibi davranan sahte servis
const TOTAL = 45;

class FakeSavedChartsService {
  readonly listCalls: { limit: number; offset: number }[] = [];
  readonly all = Array.from({ length: TOTAL }, (_, i) => makeChart(i + 1));
  private readonly deleted = new Map<string, ChartSummary>();
  /** Bu id'lerin geri alınması başarısız olur (hata senaryosu için) */
  readonly failRestore = new Set<string>();

  list(limit: number, offset: number): Observable<ChartList> {
    this.listCalls.push({ limit, offset });
    return of({ items: this.all.slice(offset, offset + limit), total: this.all.length, limit, offset });
  }

  delete(id: string): Observable<void> {
    const index = this.all.findIndex((c) => c.id === id);
    const [item] = this.all.splice(index, 1);
    this.deleted.set(id, item);
    return of(undefined);
  }

  restore(id: string): Observable<SavedChart> {
    const item = this.deleted.get(id);
    if (!item || this.failRestore.has(id)) {
      return throwError(() => new HttpErrorResponse({ status: 404 }));
    }
    this.deleted.delete(id);
    this.all.push(item);
    this.all.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return of(item as unknown as SavedChart); // bileşen dönen değeri kullanmıyor
  }
}

describe('MyCharts', () => {
  let fixture: ComponentFixture<MyCharts>;
  let component: MyCharts;
  let service: FakeSavedChartsService;

  beforeEach(async () => {
    service = new FakeSavedChartsService();

    TestBed.configureTestingModule({
      imports: [MyCharts],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SavedChartsService, useValue: service },
      ],
    });

    fixture = TestBed.createComponent(MyCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('ilk açılışta sadece ilk 20 haritayı yüklemeli', () => {
    expect(service.listCalls).toEqual([{ limit: 20, offset: 0 }]);
    expect(component.charts().length).toBe(20);
    expect(component.total()).toBe(TOTAL);
    expect(component.hasMore()).toBe(true);
  });

  it('"Daha fazla yükle" sonraki 20 haritayı listenin sonuna eklemeli', () => {
    component.loadMore();

    expect(service.listCalls[1]).toEqual({ limit: 20, offset: 20 });
    expect(component.charts().length).toBe(40);
    expect(component.charts()[20].id).toBe('id-21');
  });

  it('tüm haritalar gelince "daha fazla" kalmamalı', () => {
    component.loadMore();
    component.loadMore();

    expect(component.charts().length).toBe(TOTAL);
    expect(component.hasMore()).toBe(false);

    component.loadMore(); // gelecek kayıt yokken istek atmamalı
    expect(service.listCalls.length).toBe(3);
  });

  it('silme sonrası haritayı atlamadan doğru yerden devam etmeli', () => {
    component.remove(component.charts()[0]); // id-1 silindi, sunucuda 44 harita kaldı

    expect(component.total()).toBe(TOTAL - 1);

    component.loadMore();

    // Elde 19 harita var -> 19. kayıttan devam edilmeli (yoksa id-21 atlanırdı)
    expect(service.listCalls[1]).toEqual({ limit: 20, offset: 19 });
    expect(component.charts().map((c) => c.id)).toContain('id-21');
  });

  it('"Daha az göster" listeyi ilk 20 haritaya indirmeli', () => {
    window.scrollTo = () => {}; // test ortamında sayfa kaydırma yok
    component.loadMore();
    component.showLess();

    expect(component.charts().length).toBe(20);
    expect(component.hasMore()).toBe(true);
  });

  it('"Aç" kayıtlı haritayı /harita/<id> adresinde açmalı', () => {
    const router = TestBed.inject(Router);
    const navigated: unknown[][] = [];
    router.navigate = (commands: unknown[]) => {
      navigated.push(commands);
      return Promise.resolve(true);
    };

    component.open(component.charts()[0]);

    expect(navigated).toEqual([['/harita', 'id-1']]);
  });

  // ================= Geri alma =================
  describe('silmeyi geri alma', () => {
    const ids = () => component.charts().map((c) => c.id);

    afterEach(() => vi.useRealTimers());

    it('tek harita silinince adını göstermeli ve geri getirmeli', () => {
      component.remove(component.charts()[0]);

      expect(component.undoMessage()).toBe('“Harita 1” silindi.');

      component.undoDelete();

      expect(ids()[0]).toBe('id-1'); // eski yerine döndü
      expect(component.total()).toBe(TOTAL);
      expect(component.recentlyDeleted()).toEqual([]);
    });

    it('üst üste silinen haritaların HEPSİNİ eski yerlerine geri getirmeli', () => {
      const before = ids();
      component.remove(component.charts()[0]); // id-1
      component.remove(component.charts()[2]); // id-4 (id-1 silindikten sonra 3. sırada)
      component.remove(component.charts()[0]); // id-2

      expect(component.recentlyDeleted().map((c) => c.id)).toEqual(['id-1', 'id-4', 'id-2']);
      expect(component.undoMessage()).toBe('3 harita silindi.');
      expect(component.total()).toBe(TOTAL - 3);

      component.undoDelete();

      expect(ids()).toEqual(before);
      expect(component.total()).toBe(TOTAL);
    });

    it('her yeni silme süreyi baştan başlatmalı, süre dolunca liste boşalmalı', () => {
      vi.useFakeTimers();

      component.remove(component.charts()[0]);
      vi.advanceTimersByTime(7_000);
      component.remove(component.charts()[0]); // süre 8 saniyeden yeniden başladı
      vi.advanceTimersByTime(7_000);

      expect(component.recentlyDeleted()).toHaveLength(2); // ilk silme hâlâ geri alınabilir

      vi.advanceTimersByTime(1_000);

      expect(component.recentlyDeleted()).toEqual([]);
    });

    it('biri geri alınamazsa diğerleri yine gelmeli ve hata gösterilmeli', () => {
      component.remove(component.charts()[0]); // id-1
      component.remove(component.charts()[0]); // id-2
      service.failRestore.add('id-1');

      component.undoDelete();

      expect(ids()).toContain('id-2');
      expect(ids()).not.toContain('id-1');
      expect(component.total()).toBe(TOTAL - 1);
      expect(component.actionError()).not.toBeNull();
    });
  });
});