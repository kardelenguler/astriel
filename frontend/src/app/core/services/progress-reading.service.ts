import { Injectable } from '@angular/core';

import {
  PROGRESS_MOON_TEXTS,
  PROGRESS_SUN_TEXTS,
} from '../content/progress-texts/cards';
import {
  PROGRESS_AREAS,
  PROGRESS_EMPTY_FALLBACK,
  PROGRESS_EMPTY_TEXTS,
  PROGRESS_HOUSE_THEMES,
  PROGRESS_PLANET_CLOSING,
  PROGRESS_PLANET_LINES,
  PROGRESS_PRIORITY,
  ProgressAreaKey,
} from '../content/progress-texts/readings';
import { HOUSE_LABELS, SIGN_STYLES } from '../content/solar-return-texts/year-areas';
import { ChartResponse, Planet } from '../models/chart';

/** Bir alanda en fazla kaç gezegen için ayrı cümle yazılır */
const MAX_PLANET_SENTENCES = 2;

/** "Yaş Yorumları" kartlarından biri */
export interface ProgressArea {
  key: ProgressAreaKey;
  title: string; // "Aşk ve İlişkiler"
  subtitle: string; // "Ay · 7. ev" ya da "Belirgin vurgu yok"
  text: string; // tam metin
  houses: number[];
}

/**
 * Progress haritasından yaş yorumlarını üretir.
 * Dolu alan: evin teması + gezegenin katkısı + burcun tarzı + kapanış önerisi.
 * Boş alan: sakin dönem cümlesi + ev kuşağının burcu + en vurgulu alana yönlendirme.
 */
@Injectable({ providedIn: 'root' })
export class ProgressReadingService {
  /** Kartlar; doğum saati bilinmiyorsa sadece "Genel Tema" çıkar */
  areas(chart: ChartResponse): ProgressArea[] {
    const areas: ProgressArea[] = [];

    const theme = this.theme(chart);
    if (theme) {
      areas.push(theme);
    }

    const planets = PROGRESS_PRIORITY.map((key) => chart.planets.find((p) => p.key === key)).filter(
      (p): p is Planet => !!p && p.house !== null,
    );
    if (planets.length === 0) {
      return areas;
    }

    const groups = PROGRESS_AREAS.filter((area) => area.key !== 'theme').map((area) => ({
      area,
      inArea: planets.filter((p) => area.houses.includes(p.house as number)),
    }));
    // En çok gezegenin toplandığı alan (eşitlikte listede önce gelen)
    const strongest = groups.reduce((best, g) => (g.inArea.length > best.inArea.length ? g : best));

    for (const { area, inArea } of groups) {
      areas.push({
        key: area.key,
        title: area.title,
        subtitle: this.subtitle(inArea),
        text:
          inArea.length > 0
            ? this.text(inArea)
            : this.emptyText(chart, area.key, area.houses, strongest.area.key, strongest.area.title),
        houses: area.houses,
      });
    }
    return areas;
  }

  /** Genel Tema: Güneş'in evi ve burcu, Ay'ın burcu */
  private theme(chart: ChartResponse): ProgressArea | null {
    const sun = chart.planets.find((p) => p.key === 'sun');
    const moon = chart.planets.find((p) => p.key === 'moon');
    if (!sun && !moon) {
      return null;
    }

    const parts: string[] = [];
    if (sun?.house) {
      parts.push(PROGRESS_HOUSE_THEMES[sun.house] ?? '');
    }
    if (sun) {
      parts.push(PROGRESS_SUN_TEXTS[sun.sign.key] ?? '');
    }
    if (moon) {
      parts.push(PROGRESS_MOON_TEXTS[moon.sign.key] ?? '');
    }

    const labels: string[] = [];
    if (sun) {
      labels.push(`Güneş · ${sun.house ? `${sun.house}. ev` : sun.sign.name}`);
    }
    if (moon) {
      labels.push(`Ay · ${moon.house ? `${moon.house}. ev` : moon.sign.name}`);
    }

    return {
      key: 'theme',
      title: 'Genel Tema',
      subtitle: labels.join(', '),
      text: parts.filter(Boolean).join(' '),
      houses: [],
    };
  }

  private subtitle(planets: Planet[]): string {
    if (planets.length === 0) {
      return 'Belirgin vurgu yok';
    }
    return planets
      .slice(0, MAX_PLANET_SENTENCES)
      .map((p) => `${p.name} · ${p.house}. ev`)
      .join(', ');
  }

  /** Gezegen bulunan alanın yorumu */
  private text(planets: Planet[]): string {
    const [main, ...others] = planets;
    const second = others[0];
    const rest = others.slice(MAX_PLANET_SENTENCES - 1);
    const parts: string[] = [];

    parts.push(PROGRESS_HOUSE_THEMES[main.house as number] ?? '');
    parts.push(PROGRESS_PLANET_LINES[main.key] ?? '');
    parts.push(this.signSentence(main));
    if (second) {
      const line = PROGRESS_PLANET_LINES[second.key];
      parts.push(line ? `Ayrıca ${line}` : '');
    }
    if (rest.length > 0) {
      parts.push(`Bu alanda ayrıca ${rest.map((p) => p.name).join(' ve ')} de yer alıyor.`);
    }

    const retro = planets.slice(0, MAX_PLANET_SENTENCES).filter((p) => p.retrograde);
    if (retro.length > 0) {
      const names = retro.map((p) => `Progress ${p.name}`).join(' ve ');
      parts.push(
        `${names} geri hareket ediyor; bu konularda acele etmeden yeniden gözden geçirmek iyi olur.`,
      );
    }
    parts.push(PROGRESS_PLANET_CLOSING[main.key] ?? '');

    return parts.filter(Boolean).join(' ');
  }

  /** Gezegeni olmayan alanın yorumu: sakin dönem + ev kuşağı burçları + yönlendirme */
  private emptyText(
    chart: ChartResponse,
    areaKey: ProgressAreaKey,
    houses: number[],
    strongestKey: ProgressAreaKey,
    strongestTitle: string,
  ): string {
    const parts: string[] = [PROGRESS_EMPTY_TEXTS[areaKey] ?? PROGRESS_EMPTY_FALLBACK];

    for (const house of houses) {
      const sign = chart.houses[house - 1]?.sign;
      const style = sign ? SIGN_STYLES[sign.key] : undefined;
      if (sign && style) {
        parts.push(
          `${HOUSE_LABELS[house]} ${sign.name} burcunda başlıyor; bu alanda ${style} bir tarz doğal gelir.`,
        );
      }
    }

    if (strongestKey !== areaKey) {
      parts.push(`Bu dönemde enerjin daha çok ${strongestTitle} alanında yoğunlaşıyor.`);
    }
    return parts.join(' ');
  }

  /** "Progress Ay Terazi burcunda olduğu için bu alanda dengeli, uyumlu ve diplomatik bir tarz öne çıkabilir." */
  private signSentence(planet: Planet): string {
    const style = SIGN_STYLES[planet.sign.key];
    if (!style) {
      return '';
    }
    return `Progress ${planet.name} ${planet.sign.name} burcunda olduğu için bu alanda ${style} bir tarz öne çıkabilir.`;
  }
}