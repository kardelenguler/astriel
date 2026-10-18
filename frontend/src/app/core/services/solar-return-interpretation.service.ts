import { Injectable } from '@angular/core';

import { HOUSE_MEANINGS } from '../content/houses';
import { SIGN_MEANINGS } from '../content/signs';
import { SOLAR_ASCENDANT_TEXTS } from '../content/solar-return-texts/ascendant';
import { SOLAR_RETURN_MEANINGS } from '../content/solar-return-texts/meanings';
import { SOLAR_MOON_TEXTS } from '../content/solar-return-texts/moon';
import { SOLAR_SUN_HOUSE_TEXTS } from '../content/solar-return-texts/sun-house';
import { Interpretation } from '../models/interpretation';

interface SignPlacement {
  sign: { key: string };
  formatted: string; // "29°39' İkizler"
}

interface HousePlacement {
  formatted: string;
  house: number | null;
}

interface MoonPlacement extends SignPlacement {
  house: number | null;
}

/** Solar Return kartlarının (Yükselen, Güneş'in evi, Ay) yorumlarını oluşturur. */
@Injectable({ providedIn: 'root' })
export class SolarReturnInterpretationService {
  forAscendant(ascendant: SignPlacement): Interpretation | null {
    const sign = SIGN_MEANINGS[ascendant.sign.key];
    const text = SOLAR_ASCENDANT_TEXTS[ascendant.sign.key];
    if (!sign || !text) {
      return null;
    }
    const meaning = SOLAR_RETURN_MEANINGS.ascendant;
    return {
      id: 'solar-ascendant',
      title: meaning.title,
      keywords: meaning.keywords,
      position: ascendant.formatted,
      description: meaning.description,
      heading: `${sign.locative} Yükselen`,
      text,
      source: 'static',
    };
  }

  forSun(sun: HousePlacement): Interpretation | null {
    if (sun.house === null) {
      return null; // saat bilinmiyorsa ev yok
    }
    const text = SOLAR_SUN_HOUSE_TEXTS[sun.house];
    if (!text) {
      return null;
    }
    const meaning = SOLAR_RETURN_MEANINGS.sun;
    return {
      id: 'solar-sun',
      title: meaning.title,
      keywords: meaning.keywords,
      position: `${sun.formatted} · ${sun.house}. Ev`,
      description: meaning.description,
      heading: `${sun.house}. Evde Güneş`,
      text,
      source: 'static',
    };
  }

  forMoon(moon: MoonPlacement): Interpretation | null {
    const sign = SIGN_MEANINGS[moon.sign.key];
    const text = SOLAR_MOON_TEXTS[moon.sign.key];
    if (!sign || !text) {
      return null;
    }
    const meaning = SOLAR_RETURN_MEANINGS.moon;

    const notes: string[] = [];
    const house = moon.house !== null ? HOUSE_MEANINGS[moon.house] : undefined;
    if (house) {
      notes.push(
        `Ay ${moon.house}. evde yer alıyor. Duygusal ihtiyaçların bu yıl özellikle ` +
          `${house.title.toLocaleLowerCase('tr-TR')} alanında öne çıkabilir.`,
      );
    }

    return {
      id: 'solar-moon',
      title: meaning.title,
      keywords: meaning.keywords,
      position: moon.formatted,
      description: meaning.description,
      heading: `${sign.locative} Ay`,
      text,
      notes,
      source: 'static',
    };
  }
}