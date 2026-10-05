import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  ELEMENTS,
  MODALITIES,
  PLANETS,
  PlanetKey,
  SIGN_PROFILES,
  SignProfile,
  elementText,
  modalityText,
  rulerName,
  rulerText,
} from '../../../core/content/guides/sign-profiles';
import { SIGN_GUIDES } from '../../../core/content/guides/sign-guides';
import { findGuide } from '../find-guide';
import { GuideIcon, GuideIconName } from '../guide-icon';

// \uFE0E: sembollerin renkli emoji olarak değil, düz yazı olarak çizilmesini sağlar
const PLANET_GLYPHS: Partial<Record<PlanetKey, string>> = {
  sun: '☉\uFE0E',
  moon: '☽\uFE0E',
  mercury: '☿\uFE0E',
  venus: '♀\uFE0E',
  mars: '♂\uFE0E',
  jupiter: '♃\uFE0E',
  saturn: '♄\uFE0E',
};

/** İkon ya da (gezegenlerde) sembolle gösterilen bir kart/satır */
interface Item {
  icon?: GuideIconName;
  glyph?: string;
  title: string;
  text: string;
}

/** Burç sayfası: /burclar/boga. Tüm içerik sign-profiles.ts ve sign-guides.ts'ten gelir. */
@Component({
  selector: 'app-sign-detail',
  imports: [RouterLink, GuideIcon],
  templateUrl: './sign-detail.html',
  styleUrls: ['../guide.scss', './sign-detail.scss'],
})
export class SignDetail {
  private readonly route = inject(ActivatedRoute);

  // /burclar/koc'tan /burclar/boga'ya geçince sayfa yeniden oluşturulmaz; adres izlenir
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly slug = computed(() => this.params().get('slug') ?? '');

  protected readonly guide = computed(() => findGuide(SIGN_GUIDES, this.slug()));
  protected readonly sign = computed(() => SIGN_PROFILES.find((s) => s.slug === this.slug()));

  /** Bilgi şeridi: tarih, element, nitelik, yönetici gezegen */
  protected readonly facts = computed<Item[]>(() => {
    const sign = this.sign();
    if (!sign) {
      return [];
    }
    return [
      { icon: 'calendar', title: 'Tarih', text: sign.dates },
      { icon: sign.element, title: 'Element', text: ELEMENTS[sign.element].name },
      { icon: sign.modality, title: 'Nitelik', text: MODALITIES[sign.modality].name },
      { glyph: PLANET_GLYPHS[sign.ruler], title: 'Yönetici Gezegen', text: rulerName(sign) },
    ];
  });

  /** "Element, Nitelik ve Yönetici Gezegen" kartları */
  protected readonly qualities = computed<Item[]>(() => {
    const sign = this.sign();
    if (!sign) {
      return [];
    }
    return [
      { icon: sign.element, title: ELEMENTS[sign.element].title, text: elementText(sign) },
      { icon: sign.modality, title: MODALITIES[sign.modality].title, text: modalityText(sign) },
      { glyph: PLANET_GLYPHS[sign.ruler], title: PLANETS[sign.ruler].name, text: rulerText(sign) },
    ];
  });

  /** "Doğum Haritanda ..." kartları */
  protected readonly inChart = computed<Item[]>(() => {
    const sign = this.sign();
    if (!sign) {
      return [];
    }
    return [
      { icon: 'sun', title: `Güneş ${sign.locative}`, text: sign.inChart.sun },
      { icon: 'moon', title: `Ay ${sign.locative}`, text: sign.inChart.moon },
      { icon: 'rising', title: `Yükselen ${sign.name}`, text: sign.inChart.rising },
      { icon: 'house', title: `Evlerdeki ${sign.name}`, text: sign.inChart.houses },
    ];
  });

  /** "Diğer Burçları Keşfet": önceki, bu ve sonraki burç (Balık'tan sonra Koç gelir) */
  protected readonly explore = computed<SignProfile[]>(() => {
    const index = SIGN_PROFILES.findIndex((s) => s.slug === this.slug());
    if (index < 0) {
      return [];
    }
    const at = (offset: number) => SIGN_PROFILES[(index + offset + 12) % 12];
    return [at(-1), at(0), at(1)];
  });

  protected glyph(sign: SignProfile): string {
    return sign.glyph + '\uFE0E';
  }
}