import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NEVER, Observable } from 'rxjs';

import { ChartResponse } from '../../core/models/chart';
import { ProgressedRequest, ProgressedResponse } from '../../core/models/progressed';
import { ChartService } from '../../core/services/chart.service';
import { Progressed } from './progressed';

// Sahte servis: backend'e istek atmaz, sadece hangi bilgiyle çağrıldığını kaydeder.
class FakeChartService {
  readonly requests: ProgressedRequest[] = [];
  progressed(request: ProgressedRequest): Observable<ProgressedResponse> {
    this.requests.push(request);
    return NEVER;
  }
}

/** Bugünün yerel tarihi, "2026-10-18" biçiminde (bileşendekiyle aynı mantık) */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

describe('Progressed', () => {
  let chartService: FakeChartService;

  beforeEach(() => {
    chartService = new FakeChartService();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ChartService, useValue: chartService },
      ],
    });
  });

  /** Doğum bilgileriyle bileşeni açar (çark sonuç gelince çizilir; burada sonuç hiç gelmez) */
  async function create() {
    const fixture = TestBed.createComponent(Progressed);
    fixture.componentRef.setInput('request', {
      birth_date: '1995-06-15',
      birth_time: '14:30',
      latitude: 36.8969,
      longitude: 30.7133,
    });
    fixture.componentRef.setInput('natal', { planets: [] } as unknown as ChartResponse);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  async function change(fixture: Awaited<ReturnType<typeof create>>, date: string) {
    fixture.componentInstance.setDate(date);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('açılınca bugünün tarihiyle ilerletilmiş harita istemeli', async () => {
    await create();

    expect(chartService.requests).toHaveLength(1);
    expect(chartService.requests[0]).toMatchObject({
      birth_date: '1995-06-15',
      target_date: todayIso(),
    });
  });

  it('tarih değişince yeni istek atmalı', async () => {
    const fixture = await create();

    await change(fixture, '2030-01-01');

    expect(chartService.requests.at(-1)?.target_date).toBe('2030-01-01');
  });

  it('en erken tarih doğumdan bir gün sonrası olmalı', async () => {
    const fixture = await create();

    expect(fixture.componentInstance.minDate()).toBe('1995-06-16');
  });

  it('doğumdan önceki ya da boş tarih için istek atmamalı', async () => {
    const fixture = await create();
    expect(chartService.requests).toHaveLength(1);

    await change(fixture, '1990-01-01');
    await change(fixture, '');

    expect(chartService.requests).toHaveLength(1);
    expect(fixture.componentInstance.dateError()).toBe('Bir tarih seç.');
  });

  it('yıl oku tarihi bir yıl kaydırmalı', async () => {
    const fixture = await create();
    await change(fixture, '2030-03-10');

    fixture.componentInstance.shiftYear(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.targetDate()).toBe('2031-03-10');
  });
});