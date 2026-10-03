import { Injectable } from '@angular/core';

import { HOUSE_MEANINGS } from '../content/houses';
import { PLANET_MEANINGS } from '../content/planets';
import { POINT_MEANINGS, PointKey } from '../content/points';
import { SIGN_MEANINGS, SignMeaning } from '../content/signs';
import { Interpretation } from '../models/interpretation';

/** Yorum için gereken en az bilgi: hangi burçta ve kaç derecede */
interface Placement {
  sign: { key: string };
  formatted: string; // "29°39' İkizler"
}

/** Gezegenler için ek bilgi: hangi evde ve geri hareket ediyor mu */
interface PlanetPlacement extends Placement {
  key: string;
  house: number | null; // doğum saati bilinmiyorsa null
  retrograde: boolean;
}

/**
 * Hazır metin parçalarını birleştirerek yorum oluşturur.
 * İleride yapay zekâ eklenince yorumlar bu servisten gelmeye devam edecek;
 * sayfaların değişmesi gerekmeyecek.
 */
@Injectable({ providedIn: 'root' })
export class InterpretationService {
  /** Örnek: forHouse(1, İkizler'deki ev başlangıcı) → "İkizler'de 1. Ev" yorumu */
  forHouse(houseNo: number, cusp: Placement): Interpretation | null {
    const house = HOUSE_MEANINGS[houseNo];
    const sign = SIGN_MEANINGS[cusp.sign.key];
    if (!house || !sign) {
      return null; // beklenmeyen veri: sayfa nazik bir mesaj gösterir
    }

    return {
      id: `house-${houseNo}`,
      title: `${houseNo}. Ev · ${house.title}`,
      keywords: house.keywords,
      position: cusp.formatted,
      description: house.description,
      heading: `${sign.locative} ${houseNo}. Ev`,
      text: this.signText(sign, house.area),
      source: 'static',
    };
  }

  /** Örnek: forPoint('sun', Güneş) → "Kova'da Güneş" yorumu */
  forPoint(key: PointKey, placement: Placement): Interpretation | null {
    const point = POINT_MEANINGS[key];
    const sign = SIGN_MEANINGS[placement.sign.key];
    if (!point || !sign) {
      return null;
    }

    return {
      id: `point-${key}`,
      title: point.title,
      keywords: point.keywords,
      position: placement.formatted,
      description: point.description,
      heading: point.heading(sign),
      text: this.signText(sign, point.area),
      source: 'static',
    };
  }

  /** Örnek: forPlanet(Merkür) → "Oğlak'ta Merkür" + ev ve retro notları */
  forPlanet(planet: PlanetPlacement): Interpretation | null {
    const meaning = PLANET_MEANINGS[planet.key];
    const sign = SIGN_MEANINGS[planet.sign.key];
    if (!meaning || !sign) {
      return null;
    }

    const notes: string[] = [];

    const house = planet.house !== null ? HOUSE_MEANINGS[planet.house] : undefined;
    if (house) {
      notes.push(
        `${meaning.title} ${planet.house}. evde yer alıyor. Bu yerleşim, ${meaning.themes} ` +
          `temalarının özellikle ${house.title.toLocaleLowerCase('tr-TR')} alanında öne çıkabileceğini gösterir.`,
      );
    }

    if (planet.retrograde) {
      notes.push(
        `${meaning.title} doğum anında retro (geri) hareket ediyordu. Retro gezegenlerin temaları, ` +
          'geleneksel olarak daha içe dönük ve gözden geçirilerek yaşanan konularla ilişkilendirilir.',
      );
    }

    return {
      id: `planet-${planet.key}`,
      title: meaning.title,
      keywords: meaning.keywords,
      position: planet.formatted,
      description: meaning.description,
      heading: `${sign.locative} ${meaning.title}`,
      text: this.signText(sign, meaning.area),
      notes,
      source: 'static',
    };
  }

  /** "İkizler etkisi bu alanda ... Kişi kendini ifade ederken ... eğiliminde olabilir." */
  private signText(sign: SignMeaning, area: string): string {
    return (
      `${sign.name} etkisi bu alanda ${sign.themes} temalarını öne çıkarabilir. ` +
      `Kişi ${area} ${sign.style}`
    );
  }
} 