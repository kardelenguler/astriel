import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NEVER, Observable } from 'rxjs';

import { Place } from '../../core/models/place';
import { SolarReturnRequest, SolarReturnResponse } from '../../core/models/solar-return';
import { ChartService } from '../../core/services/chart.service';
import { SolarReturn } from './solar-return';

// Sahte servis: backend'e istek atmaz, sadece hangi bilgiyle çağrıldığını kaydeder.
class FakeChartService {
  readonly requests: SolarReturnRequest[] = [];
  solarReturn(request: SolarReturnRequest): Observable<SolarReturnResponse> {
    this.requests.push(request);
    return NEVER;
  }
}

const BERLIN: Place = {
  name: 'Berlin',
  display_name: 'Berlin, Almanya',
  latitude: 52.52,
  longitude: 13.4,
  country: 'Almanya',
};

describe('SolarReturn', () => {
  const thisYear = new Date().getFullYear();
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

  /** Doğum yılı verilen bilgilerle bileşeni açar */
  async function create(birthYear: number) {
    const fixture = TestBed.createComponent(SolarReturn);
    fixture.componentRef.setInput('request', {
      birth_date: `${birthYear}-06-15`,
      birth_time: '14:30',
      latitude: 36.8969,
      longitude: 30.7133,
    });
    fixture.componentRef.setInput('birthPlaceName', 'Antalya');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('bu yılın Güneş dönüşünü doğum yerine göre istemeli', async () => {
    await create(1995);

    expect(chartService.requests).toHaveLength(1);
    expect(chartService.requests[0]).toMatchObject({
      birth_date: '1995-06-15',
      year: thisYear,
    });
    expect(chartService.requests[0].return_latitude).toBeUndefined();
  });

  it('yıl okları yılı değiştirip yeni istek atmalı', async () => {
    const fixture = await create(1995);

    fixture.componentInstance.shiftYear(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(chartService.requests.at(-1)?.year).toBe(thisYear + 1);
  });

  it('doğum yılından önceki yıllara gidilmemeli', async () => {
    const fixture = await create(thisYear - 1); // en erken yıl = bu yıl

    expect(fixture.componentInstance.canPrev()).toBe(false);
    fixture.componentInstance.shiftYear(-1);
    expect(fixture.componentInstance.year()).toBe(thisYear);
  });

  it('başka yer seçilince yer seçilene kadar istek atılmamalı', async () => {
    const fixture = await create(1995);
    expect(chartService.requests).toHaveLength(1);

    fixture.componentInstance.setMode('other');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(chartService.requests).toHaveLength(1); // yer yok, yeni istek yok

    fixture.componentInstance.choosePlace(BERLIN);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(chartService.requests).toHaveLength(2);
    expect(chartService.requests[1]).toMatchObject({
      year: thisYear,
      return_latitude: 52.52,
      return_longitude: 13.4,
    });
  });
});