import { TestBed } from '@angular/core/testing';

import { ChartResponse } from '../../core/models/chart';
import { ChartTables } from './chart-tables';

const sign = { key: 'aries', name: 'Koç', element: 'fire', modality: 'cardinal' };

function makeChart(withHouses: boolean): ChartResponse {
  return {
    house_system: withHouses ? { code: 'P', name: 'Placidus' } : null,
    houses: withHouses
      ? Array.from({ length: 12 }, (_, i) => ({ longitude: i * 30, sign, formatted: `0° Koç` }))
      : [],
    planets: [
      { key: 'sun', name: 'Güneş', longitude: 10, sign, degree: 10, formatted: `10°00' Koç`, speed: 1, retrograde: false, house: 1 },
      { key: 'mars', name: 'Mars', longitude: 40, sign, degree: 10, formatted: `10°00' Boğa`, speed: -0.2, retrograde: true, house: 2 },
    ],
    aspects: [
      { first: 'sun', second: 'mars', type: { key: 'sextile', name: 'Altmışlık', angle: 60, orb: 6 }, angle: 61, orb: 1, applying: true },
    ],
  } as unknown as ChartResponse;
}

describe('ChartTables', () => {
  function create(chart: ChartResponse) {
    const fixture = TestBed.createComponent(ChartTables);
    fixture.componentRef.setInput('chart', chart);
    fixture.detectChanges();
    return fixture;
  }

  function click(fixture: ReturnType<typeof create>, label: string) {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.views button'),
    );
    buttons.find((b) => b.textContent?.trim() === label)?.click();
    fixture.detectChanges();
  }

  it('başlangıçta gezegen tablosunu göstermeli', () => {
    const fixture = create(makeChart(true));

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Retro');
  });

  it('Açılar sekmesinde gezegen adlarını göstermeli', () => {
    const fixture = create(makeChart(true));

    click(fixture, 'Açılar');

    expect(fixture.nativeElement.textContent).toContain('Güneş – Mars');
    expect(fixture.nativeElement.textContent).toContain('Altmışlık');
  });

  it('Evler sekmesinde 12 ev göstermeli', () => {
    const fixture = create(makeChart(true));

    click(fixture, 'Evler');

    expect(fixture.nativeElement.querySelectorAll('.house')).toHaveLength(12);
  });

  it('doğum saati bilinmiyorsa Evler sekmesi olmamalı', () => {
    const fixture = create(makeChart(false));

    const labels = Array.from(fixture.nativeElement.querySelectorAll('.views button')).map(
      (b) => (b as HTMLElement).textContent?.trim(),
    );
    expect(labels).toEqual(['Gezegenler', 'Açılar']);
  });
});