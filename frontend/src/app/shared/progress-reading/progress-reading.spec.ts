import { TestBed } from '@angular/core/testing';

import { ChartResponse } from '../../core/models/chart';
import { ProgressReading } from './progress-reading';

function chartWithoutHouses(): ChartResponse {
  return {
    planets: [
      {
        key: 'sun',
        name: 'Güneş',
        house: null,
        retrograde: false,
        sign: { key: 'aquarius', name: 'Kova' },
      },
      {
        key: 'moon',
        name: 'Ay',
        house: null,
        retrograde: false,
        sign: { key: 'libra', name: 'Terazi' },
      },
    ],
    houses: [],
  } as unknown as ChartResponse;
}

function chartWithHouses(): ChartResponse {
  return {
    planets: [
      {
        key: 'sun',
        name: 'Güneş',
        house: 4,
        retrograde: false,
        sign: { key: 'aquarius', name: 'Kova' },
      },
      {
        key: 'moon',
        name: 'Ay',
        house: 7,
        retrograde: false,
        sign: { key: 'libra', name: 'Terazi' },
      },
    ],
    houses: Array.from({ length: 12 }, () => ({ sign: { key: 'aries', name: 'Koç' } })),
  } as unknown as ChartResponse;
}

describe('ProgressReading', () => {
  function create(chart: ChartResponse, age: number | null) {
    const fixture = TestBed.createComponent(ProgressReading);
    fixture.componentRef.setInput('chart', chart);
    fixture.componentRef.setInput('age', age);
    fixture.detectChanges();
    return fixture;
  }

  it('başlıkta yaşı gösterir', () => {
    const fixture = create(chartWithoutHouses(), 43);
    expect(fixture.componentInstance.title()).toBe('43 Yaşında Öne Çıkanlar');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('43 Yaşında Öne Çıkanlar');
  });

  it('yaş yoksa genel başlık kullanır', () => {
    expect(create(chartWithoutHouses(), null).componentInstance.title()).toBe(
      'Bu Yaşta Öne Çıkanlar',
    );
  });

  it('doğum saati yoksa sadece ana tema kutusu çıkar', () => {
    const fixture = create(chartWithoutHouses(), 22);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.theme')).not.toBeNull();
    expect(el.querySelectorAll('.area')).toHaveLength(0);
  });

  it('evler biliniyorsa ana tema kutusu ve beş alan kartı çıkar', () => {
    const fixture = create(chartWithHouses(), 22);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.theme')).not.toBeNull();
    expect(el.querySelectorAll('.area')).toHaveLength(5);
  });

  it('Güneş ve Ay bilgisini etiket olarak gösterir', () => {
    const fixture = create(chartWithHouses(), 22);
    expect(fixture.componentInstance.tags()).toEqual(['Güneş · 4. ev', 'Ay · 7. ev']);
  });

  it('gezegen yoksa hiçbir şey çizmez', () => {
    const empty = { planets: [], houses: [] } as unknown as ChartResponse;
    const fixture = create(empty, 22);
    expect((fixture.nativeElement as HTMLElement).querySelector('.reading')).toBeNull();
  });
});