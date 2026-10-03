import { Component, computed, input } from '@angular/core';

import { ChartResponse } from '../../core/models/chart';

type Planet = ChartResponse['planets'][number];

// ---------- Çizim ölçüleri (SVG içinde, merkez 250,250) ----------
const C = 250;
const R = {
  outer: 240,      // dış halka
  zodiac: 200,     // burç bandının iç kenarı
  signGlyph: 220,  // burç sembolleri
  planetTick: 191, // gezegenin gerçek konumunu gösteren çentik
  planet: 170,     // gezegen sembolleri
  house: 124,      // ev numaraları
  aspect: 108,     // açı çizgilerinin uçları
};
const MIN_GAP = 8; // iki gezegen sembolü arasındaki en az açı (derece)

// \uFE0E: sembollerin renkli emoji yerine düz yazı olarak çizilmesini sağlar
const VS = '\uFE0E';
const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((s) => s + VS);
const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  north_node: '☊',
  chiron: '⚷',
};
const HARMONIOUS = new Set(['trine', 'sextile']);
const HARD = new Set(['square', 'opposition']);

/** Açıyı 0–360 aralığına getirir */
function normalize(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Birbirine çok yakın gezegen sembollerini ayırır.
 * Girdi: küçükten büyüğe sıralı dereceler. Çıktı: çizim için kaydırılmış dereceler.
 */
function spread(longitudes: number[], minGap: number): number[] {
  const positions = [...longitudes];
  if (positions.length < 2) {
    return positions;
  }
  for (let iteration = 0; iteration < 60; iteration++) {
    let moved = false;
    for (let i = 0; i < positions.length; i++) {
      const j = (i + 1) % positions.length;
      let gap = positions[j] - positions[i];
      if (j === 0) {
        gap += 360; // son gezegen ile ilki arasındaki boşluk (çember)
      }
      if (gap < minGap) {
        const push = (minGap - gap) / 2;
        positions[i] -= push;
        positions[j] += push;
        moved = true;
      }
    }
    if (!moved) {
      break;
    }
  }
  return positions;
}

@Component({
  selector: 'app-chart-wheel',
  templateUrl: './chart-wheel.html',
  styleUrl: './chart-wheel.scss',
})
export class ChartWheel {
  readonly chart = input.required<ChartResponse>();

  /** Yükselen solda dursun diye çarkın döndürülme açısı (saat bilinmiyorsa 0° Koç solda) */
  private readonly rotation = computed(() => this.chart().ascendant?.longitude ?? 0);

  /** Ekliptik boylamı SVG koordinatına çevirir (burçlar saat yönünün tersine ilerler) */
  private point(longitude: number, radius: number): { x: number; y: number } {
    const angle = ((180 + longitude - this.rotation()) * Math.PI) / 180;
    return { x: C + radius * Math.cos(angle), y: C - radius * Math.sin(angle) };
  }

  // ---------- Burç bandı ----------
  protected readonly signs = computed(() =>
    SIGN_GLYPHS.map((glyph, i) => {
      const from = this.point(i * 30, R.zodiac);
      const to = this.point(i * 30, R.outer);
      const label = this.point(i * 30 + 15, R.signGlyph);
      return { glyph, x1: from.x, y1: from.y, x2: to.x, y2: to.y, x: label.x, y: label.y };
    }),
  );

  /** Her 5 derecede küçük, her 10 derecede biraz daha uzun çentik */
  protected readonly degreeTicks = computed(() => {
    const ticks = [];
    for (let d = 5; d < 360; d += 5) {
      if (d % 30 === 0) {
        continue; // burç sınırları zaten çiziliyor
      }
      const length = d % 10 === 0 ? 7 : 4;
      const from = this.point(d, R.zodiac);
      const to = this.point(d, R.zodiac + length);
      ticks.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
    }
    return ticks;
  });

  // ---------- Evler (sadece doğum saati biliniyorsa) ----------
  protected readonly houses = computed(() => {
    const cusps = this.chart().houses;
    if (cusps.length !== 12) {
      return [];
    }
    return cusps.map((cusp, i) => {
      const next = cusps[(i + 1) % 12].longitude;
      const middle = cusp.longitude + normalize(next - cusp.longitude) / 2;
      const from = this.point(cusp.longitude, R.aspect);
      const to = this.point(cusp.longitude, R.zodiac);
      const label = this.point(middle, R.house);
      return {
        no: i + 1,
        axis: i % 3 === 0, // 1, 4, 7, 10. evler: ASC, IC, DSC, MC eksenleri
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        x: label.x,
        y: label.y,
      };
    });
  });

  /** ASC ve MC etiketleri (dış halkanın dışında) */
  protected readonly axisLabels = computed(() => {
    const { ascendant, midheaven } = this.chart();
    const labels = [];
    if (ascendant) {
      labels.push({ text: 'ASC', ...this.point(ascendant.longitude, R.outer + 17) });
    }
    if (midheaven) {
      labels.push({ text: 'MC', ...this.point(midheaven.longitude, R.outer + 17) });
    }
    return labels;
  });

  // ---------- Gezegenler ----------
  protected readonly planets = computed(() => {
    const sorted = [...this.chart().planets].sort((a, b) => a.longitude - b.longitude);
    const display = spread(
      sorted.map((p) => p.longitude),
      MIN_GAP,
    );

    return sorted.map((planet: Planet, i) => {
      const tickFrom = this.point(planet.longitude, R.zodiac);
      const tickTo = this.point(planet.longitude, R.planetTick);
      const label = this.point(display[i], R.planet);
      const moved = Math.abs(display[i] - planet.longitude) > 0.5;
      const lineEnd = this.point(display[i], R.planet + 11);
      return {
        key: planet.key,
        glyph: (PLANET_GLYPHS[planet.key] ?? planet.name.slice(0, 2)) + VS,
        title: `${planet.name} · ${planet.formatted}${planet.retrograde ? ' · Retro' : ''}`,
        retrograde: planet.retrograde,
        x: label.x,
        y: label.y,
        tick: { x1: tickFrom.x, y1: tickFrom.y, x2: tickTo.x, y2: tickTo.y },
        // Sembol kaydırıldıysa gerçek konuma bağlayan ince çizgi
        connector: moved ? { x1: tickTo.x, y1: tickTo.y, x2: lineEnd.x, y2: lineEnd.y } : null,
      };
    });
  });

  // ---------- Açılar ----------
  protected readonly aspects = computed(() => {
    const longitudes = new Map(this.chart().planets.map((p) => [p.key, p.longitude]));

    return this.chart()
      .aspects.filter((a) => a.type.key !== 'conjunction')
      .flatMap((aspect) => {
        const first = longitudes.get(aspect.first);
        const second = longitudes.get(aspect.second);
        if (first === undefined || second === undefined) {
          return [];
        }
        const from = this.point(first, R.aspect);
        const to = this.point(second, R.aspect);
        const kind = HARMONIOUS.has(aspect.type.key) ? 'harmonious' : HARD.has(aspect.type.key) ? 'hard' : 'minor';
        // Orb ne kadar dar ise çizgi o kadar belirgin
        const tightness = aspect.type.orb > 0 ? 1 - aspect.orb / aspect.type.orb : 1;
        return [
          {
            kind,
            opacity: 0.25 + 0.6 * Math.max(0, tightness),
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
          },
        ];
      });
  });

  /** Ekran okuyucular için kısa özet */
  protected readonly ariaLabel = computed(() => {
    const chart = this.chart();
    const sun = chart.planets.find((p) => p.key === 'sun');
    const moon = chart.planets.find((p) => p.key === 'moon');
    const parts = ['Doğum haritası çarkı'];
    if (sun) {
      parts.push(`Güneş ${sun.sign.name}`);
    }
    if (moon) {
      parts.push(`Ay ${moon.sign.name}`);
    }
    if (chart.ascendant) {
      parts.push(`Yükselen ${chart.ascendant.sign.name}`);
    }
    return parts.join(', ');
  });
} 