import { mockChartWithSpecialPoints } from '../../testing/mock-chart';
import { ChartResponse } from '../models/chart';
import { buildSpecialPointCards } from './special-point-cards';

describe('buildSpecialPointCards', () => {
  it('doğum saati biliniyorsa 6 kartı doğru sırayla üretmeli', () => {
    const cards = buildSpecialPointCards(mockChartWithSpecialPoints());
    expect(cards.map((c) => c.info.key)).toEqual([
      'north_node',
      'south_node',
      'lilith',
      'part_of_fortune',
      'chiron',
      'juno',
    ]);
    expect(cards.every((c) => c.house === 5)).toBe(true);
    expect(cards.some((c) => c.locked)).toBe(false);
  });

  it('doğum saati yoksa Şans Noktası kilitli kart olmalı, diğerlerinde ev bilgisi boş olmalı', () => {
    const cards = buildSpecialPointCards(mockChartWithSpecialPoints({ timeKnown: false }));
    expect(cards).toHaveLength(6);

    const fortune = cards.find((c) => c.info.key === 'part_of_fortune');
    expect(fortune?.locked).toBe(true);
    expect(fortune?.sign).toBeNull();
    expect(fortune?.text).toBeNull();

    expect(cards.filter((c) => c.locked)).toHaveLength(1);
    expect(cards.every((c) => c.house === null)).toBe(true);
  });

  it('hesaplanamayan nokta atlanmalı, diğer kartlar kalmalı', () => {
    const chart = mockChartWithSpecialPoints();
    chart.special_points = chart.special_points.filter((p) => p.key !== 'juno');
    const keys = buildSpecialPointCards(chart).map((c) => c.info.key);
    expect(keys).not.toContain('juno');
    expect(keys).toHaveLength(5);
  });

  it('special_points alanı olmayan eski bir yanıtta çökmemeli', () => {
    const chart = mockChartWithSpecialPoints() as Partial<ChartResponse>;
    delete chart.special_points;
    const keys = buildSpecialPointCards(chart as ChartResponse).map((c) => c.info.key);
    expect(keys).toEqual(['north_node', 'chiron']);
  });
});