import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER, Observable } from 'rxjs';

import { ChartCalculateRequest, ChartResponse } from '../../core/models/chart';
import { SavedChart } from '../../core/models/saved-chart';
import { ChartService } from '../../core/services/chart.service';
import { SavedChartsService } from '../../core/services/saved-charts.service';
import { Chart } from './chart';

// Sahte servisler: backend'e istek atmaz, sadece hangi bilgiyle çağrıldıklarını kaydeder.
// NEVER hiç cevap dönmeyen bir istek gibidir; sayfa "yükleniyor" durumunda kalır.
class FakeChartService {
  readonly requests: ChartCalculateRequest[] = [];
  calculate(request: ChartCalculateRequest): Observable<ChartResponse> {
    this.requests.push(request);
    return NEVER;
  }
}

class FakeSavedChartsService {
  readonly requestedIds: string[] = [];
  get(id: string): Observable<SavedChart> {
    this.requestedIds.push(id);
    return NEVER;
  }
}

describe('Chart', () => {
  let chartService: FakeChartService;
  let savedCharts: FakeSavedChartsService;

  beforeEach(() => {
    chartService = new FakeChartService();
    savedCharts = new FakeSavedChartsService();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'harita', component: Chart },
          { path: 'harita/:id', component: Chart },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(), // AuthService gibi diğer servisler gerçek istek atmasın
        { provide: ChartService, useValue: chartService },
        { provide: SavedChartsService, useValue: savedCharts },
      ],
    });
  });

  /** Verilen adrese gidip harita sayfasını açar */
  async function open(url: string): Promise<Chart> {
    const harness = await RouterTestingHarness.create();
    return harness.navigateByUrl(url, Chart);
  }

  // ---------------- /harita?... (adresteki bilgilerle hesaplama) ----------------

  it('adresteki bilgileri doğru isteğe çevirmeli', async () => {
    await open('/harita?tarih=2005-01-26&saat=14:15&enlem=36.88&boylam=30.7&yer=Antalya');

    expect(chartService.requests).toEqual([
      { birth_date: '2005-01-26', birth_time: '14:15', latitude: 36.88, longitude: 30.7 },
    ]);
  });

  it('saat yoksa "saat bilinmiyor" (null) olarak göndermeli', async () => {
    await open('/harita?tarih=2005-01-26&enlem=36.88&boylam=30.7');

    expect(chartService.requests[0].birth_time).toBeNull();
  });

  it('adreste doğum bilgisi yoksa istek atmadan nazik bir hata göstermeli', async () => {
    const page = await open('/harita');

    expect(page.error()).toContain('eksik veya hatalı');
    expect(chartService.requests).toEqual([]);
  });

  it('tarih biçimi bozuksa istek atmamalı', async () => {
    const page = await open('/harita?tarih=2005-1-26&enlem=36.88&boylam=30.7');

    expect(page.error()).toContain('eksik veya hatalı');
    expect(chartService.requests).toEqual([]);
  });

  it('saat biçimi bozuksa istek atmamalı', async () => {
    const page = await open('/harita?tarih=2005-01-26&saat=25&enlem=36.88&boylam=30.7');

    expect(page.error()).toContain('eksik veya hatalı');
    expect(chartService.requests).toEqual([]);
  });

  it('enlem -90/90 dışındaysa istek atmamalı', async () => {
    const page = await open('/harita?tarih=2005-01-26&enlem=95&boylam=30.7');

    expect(page.error()).toContain('eksik veya hatalı');
    expect(chartService.requests).toEqual([]);
  });

  it('boylam sayı değilse istek atmamalı', async () => {
    const page = await open('/harita?tarih=2005-01-26&enlem=36.88&boylam=abc');

    expect(page.error()).toContain('eksik veya hatalı');
    expect(chartService.requests).toEqual([]);
  });

  // ---------------- /harita/<id> (kayıtlı harita) ----------------

  it('kayıtlı haritayı veritabanından almalı, yeniden hesaplamamalı', async () => {
    const page = await open('/harita/abc-123');

    expect(savedCharts.requestedIds).toEqual(['abc-123']);
    expect(chartService.requests).toEqual([]);
    expect(page.saveState()).toBe('saved'); // tekrar "Kaydet" düğmesi çıkmamalı
  });
});  