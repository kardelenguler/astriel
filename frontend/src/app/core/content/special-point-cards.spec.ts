import { mockChart } from '../../testing/mock-chart';
import { ChartResponse } from '../models/chart';
import { buildSpecialPointCards } from './special-point-cards';

/** mockChart'a özel nokta ve Kuzey Düğüm/Chiron ekler */
function chartWithSpecialPoints(timeKnown: boolean): ChartResponse {
  const chart = mockChart({ timeKnown });
  const sign = chart.planets[0].sign;
  const point = (key: string, name: string) => ({
    key,
    name,
    longitude: 10,
    sign,
    degree: 10,
    formatted: `10° ${sign.name}`,
    house: timeKnown ? 5 : null,
  });

  return {
    ...chart,
    planets: [
      ...chart.planets,
      { ...point('north_node', 'Kuzey Ay Düğümü'), speed: -0.05, retrograde: false },
      { ...point('chiron', 'Chiron'), speed: 0.01, retrograde: false },
    ],
    special_points: [
      point('south_node', 'Güney Ay Düğümü'),
      point('lilith', 'Lilit'),
      point('juno', 'Juno'),
      ...(timeKnown ? [point('part_of_fortune', 'Şans Noktası')] : []),
    ],
  };
}

describe('buildSpecialPointCards', () => {
  it('doğum saati biliniyorsa 6 kartı doğru sırayla üretmeli', () => {
    const cards = buildSpecialPointCards(chartWithSpecialPoints(true));
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
    const cards = buildSpecialPointCards(chartWithSpecialPoints(false));
    expect(cards).toHaveLength(6);

    const fortune = cards.find((c) => c.info.key === 'part_of_fortune');
    expect(fortune?.locked).toBe(true);
    expect(fortune?.sign).toBeNull();
    expect(fortune?.text).toBeNull();

    expect(cards.filter((c) => c.locked)).toHaveLength(1);
    expect(cards.every((c) => c.house === null)).toBe(true);
  });

  it('hesaplanamayan nokta atlanmalı, diğer kartlar kalmalı', () => {
    const chart = chartWithSpecialPoints(true);
    chart.special_points = chart.special_points.filter((p) => p.key !== 'juno');
    const keys = buildSpecialPointCards(chart).map((c) => c.info.key);
    expect(keys).not.toContain('juno');
    expect(keys).toHaveLength(5);
  });

  it('special_points alanı olmayan eski bir yanıtta çökmemeli', () => {
    const chart = chartWithSpecialPoints(true) as Partial<ChartResponse>;
    delete chart.special_points;
    const keys = buildSpecialPointCards(chart as ChartResponse).map((c) => c.info.key);
    expect(keys).toEqual(['north_node', 'chiron']);
  });
});