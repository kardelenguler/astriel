import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Reveal } from '../../shared/reveal.directive';

interface Step {
  no: string;
  label: string;
  title: string;
  text: string;
  icon: 'calendar' | 'pin' | 'star' | 'chart';
}

// ---------- Süs amaçlı doğum haritası çizimi için geometri ----------
const CENTER = 200; // SVG 400x400, merkez (200, 200)

/** Açıyı (0° = tepe, saat yönünde) SVG koordinatına çevirir */
function polar(radius: number, degrees: number): { x: number; y: number } {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(radians), y: CENTER + radius * Math.sin(radians) };
}

// \uFE0E: sembollerin renkli emoji olarak değil, düz yazı olarak çizilmesini sağlar
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((s) => s + '\uFE0E');
const PLANETS = [
  { glyph: '☉', degrees: 20 },
  { glyph: '☽', degrees: 95 },
  { glyph: '☿', degrees: 140 },
  { glyph: '♀', degrees: 205 },
  { glyph: '♂', degrees: 250 },
  { glyph: '♃', degrees: 315 },
];
const ASPECT_PAIRS = [[0, 3], [1, 4], [2, 5], [0, 2], [3, 5]];

@Component({
  selector: 'app-about',
  imports: [RouterLink, Reveal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly steps: Step[] = [
    {
      no: '01',
      label: 'Doğum bilgileri',
      title: 'Tarih ve saat',
      text: 'Doğduğun tarihi ve saati girersin. Saatini bilmiyorsan da devam edebilirsin.',
      icon: 'calendar',
    },
    {
      no: '02',
      label: 'Doğum yeri',
      title: 'Konum',
      text: 'Doğduğun yerin koordinatları ve o yerin saat dilimi belirlenir.',
      icon: 'pin',
    },
    {
      no: '03',
      label: 'Gökyüzü hesaplanır',
      title: 'Gezegen konumları',
      text: 'Swiss Ephemeris ile doğum anındaki gök cisimlerinin konumları hesaplanır.',
      icon: 'star',
    },
    {
      no: '04',
      label: 'Haritan oluşur',
      title: 'Doğum haritası',
      text: 'Hesaplanan konumlar, evler ve açılarla birlikte sana özel haritaya dönüşür.',
      icon: 'chart',
    },
  ];

  // 12 burç arasındaki çizgiler (iç halka 140 → dış halka 178)
  protected readonly ticks = Array.from({ length: 12 }, (_, i) => {
    const from = polar(140, i * 30);
    const to = polar(178, i * 30);
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  });

  // Burç sembolleri, her dilimin ortasında
  protected readonly signs = ZODIAC.map((glyph, i) => ({ glyph, ...polar(159, i * 30 + 15) }));

  // Gezegen sembolleri ve iç halkadaki noktaları
  protected readonly planets = PLANETS.map((p) => {
    const dot = polar(96, p.degrees);
    const label = polar(118, p.degrees);
    return { glyph: p.glyph + '\uFE0E', dotX: dot.x, dotY: dot.y, x: label.x, y: label.y };
  });

  // Gezegenler arasındaki açı çizgileri
  protected readonly aspects = ASPECT_PAIRS.map(([a, b]) => {
    const from = polar(96, PLANETS[a].degrees);
    const to = polar(96, PLANETS[b].degrees);
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  });
}