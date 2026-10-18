import { Injectable } from '@angular/core';

import { SOLAR_SUN_HOUSE_TEXTS } from '../content/solar-return-texts/sun-house';
import {
  PLANET_PRIORITY,
  SUN_HOUSE_HEADLINES,
  YEAR_AREAS,
  YearAreaKey,
} from '../content/solar-return-texts/year';
import {
  EMPTY_AREA_FALLBACK,
  EMPTY_AREA_TEXTS,
  HOUSE_LABELS,
  HOUSE_THEMES,
  PLANET_CLOSING,
  PLANET_LINES,
  SIGN_STYLES,
} from '../content/solar-return-texts/year-areas';
import { ChartResponse, Planet } from '../models/chart';

/** Güneş'in bir gezegenle açısı bundan darsa (derece) başlığa etiket olarak eklenir */
const TAG_MAX_ORB = 3;
/** Bir alanda en fazla kaç gezegen için ayrı cümle yazılır */
const MAX_PLANET_SENTENCES = 2;

/** "Yılın Ana Teması" kutusu */
export interface YearTheme {
  headline: string; // "Kökler, yuva ve güven"
  text: string; // Güneş'in evine göre yorum
  tags: string[]; // ["4. ev vurgusu", "Yengeç Yükselen", ...]
}

/** "Yıllık Yorumlar" kartlarından biri */
export interface YearArea {
  key: YearAreaKey;
  title: string; // "Aşk ve İlişkiler"
  subtitle: string; // "Venüs · 7. ev" ya da "Belirgin vurgu yok"
  summary: string; // metnin ilk cümlesi
  text: string; // tam metin
  houses: number[];
}

/** Metnin ilk cümlesi */
function firstSentence(text: string): string {
  const end = text.indexOf('. ');
  return end === -1 ? text : text.slice(0, end + 1);
}

/**
 * Solar Return haritasından "Yılın Ana Teması" ve yaşam alanı yorumlarını üretir.
 * Dolu alan: evin teması + gezegenin katkısı + burcun tarzı + kapanış önerisi.
 * Boş alan: sakin dönem cümlesi + ev kuşağının burcu + yılın en vurgulu alanına yönlendirme.
 */
@Injectable({ providedIn: 'root' })
export class SolarReturnYearService {
  /** Güneş'in evine göre yılın ana teması; ev bilinmiyorsa null */
  theme(chart: ChartResponse): YearTheme | null {
    const sun = chart.planets.find((p) => p.key === 'sun');
    const house = sun?.house ?? null;
    if (!sun || house === null) {
      return null;
    }
    const text = SOLAR_SUN_HOUSE_TEXTS[house];
    const headline = SUN_HOUSE_HEADLINES[house];
    if (!text || !headline) {
      return null;
    }

    const tags = [`${house}. ev vurgusu`];
    if (chart.ascendant) {
      tags.push(`${chart.ascendant.sign.name} Yükselen`);
    }
    const moon = chart.planets.find((p) => p.key === 'moon');
    if (moon) {
      tags.push(`${moon.sign.name} Ay`);
    }
    const aspect = this.tightestSunAspect(chart);
    if (aspect) {
      tags.push(aspect);
    }
    return { headline, text, tags };
  }

  /** Her yaşam alanı için yorum; evler bilinmiyorsa boş liste */
  areas(chart: ChartResponse): YearArea[] {
    const planets = PLANET_PRIORITY.map((key) => chart.planets.find((p) => p.key === key)).filter(
      (p): p is Planet => !!p && p.house !== null,
    );
    if (planets.length === 0) {
      return [];
    }

    const groups = YEAR_AREAS.map((area) => ({
      area,
      inArea: planets.filter((p) => area.houses.includes(p.house as number)),
    }));
    // En çok gezegenin toplandığı alan (eşitlikte listede önce gelen)
    const strongest = groups.reduce((best, g) => (g.inArea.length > best.inArea.length ? g : best));

    return groups.map(({ area, inArea }) => {
      const text =
        inArea.length > 0
          ? this.text(inArea)
          : this.emptyText(chart, area.key, area.houses, strongest.area.key, strongest.area.title);
      return {
        key: area.key,
        title: area.title,
        subtitle: this.subtitle(inArea),
        summary: firstSentence(text),
        text,
        houses: area.houses,
      };
    });
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

    parts.push(HOUSE_THEMES[main.house as number] ?? '');
    parts.push(PLANET_LINES[main.key] ?? '');
    parts.push(this.signSentence(main));
    if (second) {
      const line = PLANET_LINES[second.key];
      parts.push(line ? `Ayrıca ${line}` : '');
    }
    if (rest.length > 0) {
      parts.push(`Bu alanda ayrıca ${rest.map((p) => p.name).join(' ve ')} de yer alıyor.`);
    }

    const retro = planets.slice(0, MAX_PLANET_SENTENCES).filter((p) => p.retrograde);
    if (retro.length > 0) {
      const names = retro.map((p) => p.name).join(' ve ');
      parts.push(
        `${names} geri hareket ediyor; bu konularda acele etmeden yeniden gözden geçirmek iyi olur.`,
      );
    }
    parts.push(PLANET_CLOSING[main.key] ?? '');

    return parts.filter(Boolean).join(' ');
  }

  /** Gezegeni olmayan alanın yorumu: sakin dönem + ev kuşağı burçları + yönlendirme */
  private emptyText(
    chart: ChartResponse,
    areaKey: YearAreaKey,
    houses: number[],
    strongestKey: YearAreaKey,
    strongestTitle: string,
  ): string {
    const parts: string[] = [EMPTY_AREA_TEXTS[areaKey] ?? EMPTY_AREA_FALLBACK];

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
      parts.push(`Bu yıl enerjin daha çok ${strongestTitle} alanında yoğunlaşıyor.`);
    }
    return parts.join(' ');
  }

  /** "Venüs Koç burcunda olduğu için bu alanda doğrudan, atak ve hızlı bir tarz öne çıkabilir." */
  private signSentence(planet: Planet): string {
    const style = SIGN_STYLES[planet.sign.key];
    if (!style) {
      return '';
    }
    return `${planet.name} ${planet.sign.name} burcunda olduğu için bu alanda ${style} bir tarz öne çıkabilir.`;
  }

  /** Güneş'in en dar açısı yeterince darsa "Güneş – Plüton · Kavuşum" gibi bir etiket */
  private tightestSunAspect(chart: ChartResponse): string | null {
    const names = new Map(chart.planets.map((p) => [p.key, p.name]));
    const aspect = chart.aspects
      .filter((a) => a.first === 'sun' || a.second === 'sun')
      .sort((a, b) => a.orb - b.orb)[0];
    if (!aspect || aspect.orb > TAG_MAX_ORB) {
      return null;
    }
    const other = names.get(aspect.first === 'sun' ? aspect.second : aspect.first);
    return other ? `Güneş – ${other} · ${aspect.type.name}` : null;
  }
}