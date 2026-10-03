import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';

import { ChartList, ChartSummary } from '../../core/models/saved-chart';
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
    created_at: '2026-10-01T12:00:00Z',
  };
}

// Sunucuda TOTAL kadar harita varmış gibi davranan sahte servis
const TOTAL = 45;

class FakeSavedChartsService {
  readonly listCalls: { limit: number; offset: number }[] = [];
  readonly all = Array.from({ length: TOTAL }, (_, i) => makeChart(i + 1));

  list(limit: number, offset: number): Observable<ChartList> {
    this.listCalls.push({ limit, offset });
    return of({ items: this.all.slice(offset, offset + limit), total: this.all.length, limit, offset });
  }

  delete(id: string): Observable<void> {
    const index = this.all.findIndex((c) => c.id === id);
    this.all.splice(index, 1);
    return of(undefined);
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
}); 