import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  HOUSE_GROUPS,
  HOUSE_PROFILES,
  HouseProfile,
  oppositeHouse,
  oppositeText,
} from '../../../core/content/guides/house-profiles';
import { HOUSE_GUIDES } from '../../../core/content/guides/house-guides';
import { findSignProfile, rulerName } from '../../../core/content/guides/sign-profiles';
import { findGuide } from '../find-guide';
import { PLANET_GLYPHS, textGlyph } from '../glyphs';
import { GuideIcon, GuideIconName } from '../guide-icon';

/** İkon ya da sembolle gösterilen bir bilgi satırı */
interface Fact {
  icon?: GuideIconName;
  glyph?: string;
  title: string;
  text: string;
}

/** Ev sayfası: /evler/7-ev. İçerik house-profiles.ts ve house-guides.ts'ten gelir. */
@Component({
  selector: 'app-house-detail',
  imports: [RouterLink, GuideIcon],
  templateUrl: './house-detail.html',
  // Burç sayfasıyla aynı görünüm: onun stillerini kullanır, sadece eve özel kısımlar ayrı
  styleUrls: ['../guide.scss', '../sign-detail/sign-detail.scss', './house-detail.scss'],
})
export class HouseDetail {
  private readonly route = inject(ActivatedRoute);

  // /evler/1-ev'den /evler/2-ev'e geçince sayfa yeniden oluşturulmaz; adres izlenir
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly slug = computed(() => this.params().get('slug') ?? '');

  protected readonly guide = computed(() => findGuide(HOUSE_GUIDES, this.slug()));
  protected readonly house = computed(() => HOUSE_PROFILES.find((h) => h.slug === this.slug()));
  protected readonly opposite = computed(() => {
    const house = this.house();
    return house ? oppositeHouse(house) : undefined;
  });
  protected readonly oppositeText = computed(() => {
    const house = this.house();
    return house ? oppositeText(house) : '';
  });

  /** Bilgi şeridi: doğal burç, doğal yönetici, ev grubu, başlangıç noktası (yoksa karşıt ev) */
  protected readonly facts = computed<Fact[]>(() => {
    const house = this.house();
    const sign = findSignProfile(house?.naturalSign);
    if (!house || !sign) {
      return [];
    }
    const last: Fact = house.angle
      ? { icon: 'angle', title: 'Başlangıç Noktası', text: house.angle }
      : { icon: 'opposite', title: 'Karşıt Ev', text: `${oppositeHouse(house).number}. Ev` };
    return [
      { glyph: textGlyph(sign.glyph), title: 'Doğal Burç', text: sign.name },
      { glyph: PLANET_GLYPHS[sign.ruler], title: 'Doğal Yönetici', text: rulerName(sign) },
      { icon: 'layers', title: 'Ev Grubu', text: HOUSE_GROUPS[house.group] },
      last,
    ];
  });

  /** "Diğer Evleri Keşfet": önceki, bu ve sonraki ev (12. evden sonra 1. ev gelir) */
  protected readonly explore = computed<HouseProfile[]>(() => {
    const index = HOUSE_PROFILES.findIndex((h) => h.slug === this.slug());
    if (index < 0) {
      return [];
    }
    const at = (offset: number) => HOUSE_PROFILES[(index + offset + 12) % 12];
    return [at(-1), at(0), at(1)];
  });

  /** Evin kısa konuları: "İlişkiler · Ortaklıklar · Evlilik" */
  protected tagline(house: HouseProfile): string {
    return findGuide(HOUSE_GUIDES, house.slug)?.tagline ?? '';
  }

  /** Keşfet kartındaki kısa konu: "İlişkiler · Ortaklıklar · Evlilik" -> "İlişkiler" */
  protected keyword(house: HouseProfile): string {
    return this.tagline(house).split(' · ')[0];
  }

  /** İlk harfi büyük yapar (Türkçe: "istikrar" -> "İstikrar") */
  protected capitalize(text: string): string {
    return text.charAt(0).toLocaleUpperCase('tr') + text.slice(1);
  }
}