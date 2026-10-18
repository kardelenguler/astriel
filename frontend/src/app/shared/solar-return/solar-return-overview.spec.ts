import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NEVER, Observable } from 'rxjs';

import { ChartResponse, Sign } from '../../core/models/chart';
import { SolarReturnRequest, SolarReturnResponse } from '../../core/models/solar-return';
import { ChartService } from '../../core/services/chart.service';
import { SolarReturn } from './solar-return';

class FakeChartService {
  solarReturn(_request: SolarReturnRequest): Observable<SolarReturnResponse> {
    return NEVER;
  }
}

const sign: Sign = { key: 'aquarius', name: 'Kova', element: 'air', modality: 'fixed' };

function makeResponse(withHouses: boolean): SolarReturnResponse {
  const planet = (key: string, name: string) => ({
    key,
    name,
    longitude: 300,
    sign,
    degree: 6,
    formatted: `6°39' Kova`,
    speed: 1,
    retrograde: false,
    house: 4,
  });
  const type = (key: string, name: string) => ({ key, name, angle: 0, orb: 8 });
  return {
    year: 2027,
    used_birth_place: true,
    chart: {
      utc_datetime: '2027-01-26T20:22:54Z',
      utc_offset_hours: 3,
      timezone: 'Europe/Istanbul',
      ascendant: { longitude: 100, sign: { ...sign, key: 'cancer', name: 'Yengeç' }, formatted: `10° Yengeç` },
      houses: withHouses ? [{ longitude: 0, sign, formatted: `0° Kova` }] : [],
      house_system: withHouses ? { code: 'P', name: 'Placidus' } : null,
      planets: [planet('sun', 'Güneş'), planet('moon', 'Ay'), planet('saturn', 'Satürn')],
      aspects: [
        { first: 'sun', second: 'saturn', type: type('square', 'Kare'), angle: 90, orb: 3, applying: true },
        { first: 'moon', second: 'sun', type: type('trine', 'Üçgen'), angle: 120, orb: 1, applying: false },
        { first: 'moon', second: 'saturn', type: type('conjunction', 'Kavuşum'), angle: 0, orb: 2, applying: false },
      ],
      warnings: [],
    } as unknown as ChartResponse,
  };
}

describe('SolarReturn genel bakış', () => {
  async function create(withHouses = true) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ChartService, useValue: new FakeChartService() },
      ],
    });
    const fixture = TestBed.createComponent(SolarReturn);
    fixture.componentRef.setInput('request', {
      birth_date: '2005-01-26',
      birth_time: '14:15',
      latitude: 36.8969,
      longitude: 30.7133,
    });
    fixture.componentRef.setInput('birthPlaceName', 'Antalya');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.result.set(makeResponse(withHouses));
    fixture.detectChanges();
    return fixture;
  }

  it('gezegen seçilmediyse Güneş seçili olmalı', async () => {
    const fixture = await create();

    expect(fixture.componentInstance.selectedPlanet()?.key).toBe('sun');
  });

  it('seçili gezegenin açıları en dar orbdan başlayarak sıralanmalı', async () => {
    const fixture = await create();

    const aspects = fixture.componentInstance.planetAspects();

    expect(aspects.map((a) => a.type)).toEqual(['Üçgen', 'Kare']);
    expect(aspects[0].kind).toBe('harmonious');
    expect(aspects[1].kind).toBe('hard');
  });

  it('çarkta başka gezegen seçilince panel değişmeli', async () => {
    const fixture = await create();

    fixture.componentInstance.selectPlanet('saturn');

    expect(fixture.componentInstance.selectedPlanet()?.name).toBe('Satürn');
  });

  it('dönüş anını o yerin yerel saatiyle göstermeli', async () => {
    const fixture = await create();

    expect(fixture.componentInstance.momentDate()).toBe('26 Ocak 2027');
    expect(fixture.componentInstance.momentClock()).toBe('23:22');
    expect(fixture.componentInstance.offsetText()).toBe('UTC+3');
  });

  it('evler yoksa Evler sekmesi seçilse bile Genel Bakış gösterilmeli', async () => {
    const fixture = await create(false);

    fixture.componentInstance.setSubTab('houses');

    expect(fixture.componentInstance.subTab()).toBe('overview');
  });

  it('öne çıkan göstergeler en dar açıdan başlamalı, kavuşumda evi yazmalı', async () => {
    const fixture = await create();

    const highlights = fixture.componentInstance.highlights();

    expect(highlights.map((h) => h.title)).toEqual(['Ay – Güneş', 'Ay – Satürn', 'Güneş – Satürn']);
    expect(highlights[0].subtitle).toBe('Üçgen · 1.0°');
    expect(highlights[1].subtitle).toBe('4. evde kavuşum');
  });

  it('kartlardaki kısa açıklama yorumun sadece ilk tam cümlesi olmalı', async () => {
    const fixture = await create();

    const sunTeaser = fixture.componentInstance.sunTeaser();

    expect(sunTeaser).toBe('Bu yıl ev, aile ve köklerin hayatının merkezine yerleşebilir.');
    expect(fixture.componentInstance.ascendantTeaser()).toBe(
      'Bu yıl daha duyarlı, içine dönük ve korumacı bir havada olabilirsin.',
    );
    expect(fixture.componentInstance.moonTeaser().endsWith('.')).toBe(true);
  });

  it('kart açılınca "Aşağıda açık", kapalıyken "Devamını oku" yazmalı', async () => {
    const fixture = await create();
    const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text()).toContain('Devamını oku');
    expect(text()).not.toContain('Aşağıda açık');

    fixture.componentInstance.select('sun');
    fixture.detectChanges();

    expect(text()).toContain('Aşağıda açık');
  });

  it('burç sembolünü anahtardan bulmalı', async () => {
    const fixture = await create();

    expect(fixture.componentInstance.signGlyph('aquarius')).toContain('♒');
    expect(fixture.componentInstance.signGlyph('yok')).toBe('');
  });
});