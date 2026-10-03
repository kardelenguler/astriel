import { ChartResponse } from '../core/models/chart';

/**
 * Testler için örnek harita. Gerçek bir hesaplama değildir;
 * sadece component'lerin doğru çizip çizmediğini kontrol etmek için.
 */
const SIGNS = [
  ['aries', 'Koç', 'fire', 'cardinal'],
  ['taurus', 'Boğa', 'earth', 'fixed'],
  ['gemini', 'İkizler', 'air', 'mutable'],
  ['cancer', 'Yengeç', 'water', 'cardinal'],
  ['leo', 'Aslan', 'fire', 'fixed'],
  ['virgo', 'Başak', 'earth', 'mutable'],
  ['libra', 'Terazi', 'air', 'cardinal'],
  ['scorpio', 'Akrep', 'water', 'fixed'],
  ['sagittarius', 'Yay', 'fire', 'mutable'],
  ['capricorn', 'Oğlak', 'earth', 'cardinal'],
  ['aquarius', 'Kova', 'air', 'fixed'],
  ['pisces', 'Balık', 'water', 'mutable'],
] as const;

function placement(longitude: number) {
  const [key, name, element, modality] = SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)];
  return {
    longitude,
    sign: { key, name, element, modality },
    formatted: `${Math.floor(longitude % 30)}° ${name}`,
  };
}

function planet(key: string, name: string, longitude: number, retrograde = false) {
  return {
    key,
    name,
    ...placement(longitude),
    degree: longitude % 30,
    speed: retrograde ? -0.05 : 1,
    retrograde,
    house: null,
  };
}

export function mockChart(options: { timeKnown?: boolean } = {}): ChartResponse {
  const timeKnown = options.timeKnown ?? true;
  const ascendant = 89.65; // 29° İkizler

  return {
    utc_datetime: '2005-01-26T12:15:00Z',
    utc_offset_hours: 2,
    timezone: 'Europe/Istanbul',
    time_known: timeKnown,
    house_system: timeKnown ? { code: 'P', name: 'Placidus' } : null,
    ascendant: timeKnown ? placement(ascendant) : null,
    midheaven: timeKnown ? placement(341) : null,
    houses: timeKnown
      ? Array.from({ length: 12 }, (_, i) => placement((ascendant + i * 30) % 360))
      : [],
    planets: [
      planet('sun', 'Güneş', 306.63),
      planet('moon', 'Ay', 128.37),
      planet('mercury', 'Merkür', 294.1),
      planet('venus', 'Venüs', 291.05), // Merkür'e 3° yakın: semboller ayrılmalı
      planet('mars', 'Mars', 248.37),
      planet('saturn', 'Satürn', 111.5, true),
    ],
    aspects: [
      // Uyumlu
      { first: 'moon', second: 'mars', type: { key: 'trine', name: 'Üçgen', angle: 120, orb: 8 }, angle: 120, orb: 0, applying: true },
      // Zorlayıcı
      { first: 'sun', second: 'moon', type: { key: 'opposition', name: 'Karşıt', angle: 180, orb: 8 }, angle: 178.26, orb: 1.74, applying: false },
      // Kavuşum: çarkta çizilmemeli
      { first: 'mercury', second: 'venus', type: { key: 'conjunction', name: 'Kavuşum', angle: 0, orb: 8 }, angle: 3.05, orb: 3.05, applying: true },
    ],
    warnings: [],
    engine_version: 'test',
  } as ChartResponse;
} 