import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GUIDE_SYMBOLS } from '../../../core/content/guides/guide-facts';
import { HOUSE_GUIDES } from '../../../core/content/guides/house-guides';
import { SIGN_GUIDES } from '../../../core/content/guides/sign-guides';
import { GuideCollection } from '../../../core/models/guide';

interface HubCard {
  collection: GuideCollection;
  icon: 'signs' | 'houses';
  summary: string;
  symbols: string[]; // kartın altındaki küçük semboller
}

function card(collection: GuideCollection, icon: HubCard['icon'], summary: string): HubCard {
  return {
    collection,
    icon,
    summary,
    symbols: collection.items.map((item) => GUIDE_SYMBOLS[item.slug]),
  };
}

/** Rehber ana sayfası (/rehber): 12 Burç ve 12 Ev'e giriş */
@Component({
  selector: 'app-guide-hub',
  imports: [RouterLink],
  templateUrl: './guide-hub.html',
  styleUrl: '../guide.scss',
})
export class GuideHub {
  protected readonly cards: HubCard[] = [
    card(
      SIGN_GUIDES,
      'signs',
      "Koç'tan Balık'a her burcun özellikleri, tarihleri, elementi ve yönetici gezegeni.",
    ),
    card(
      HOUSE_GUIDES,
      'houses',
      'Benlikten kariyere, doğum haritasındaki 12 evin anlattığı hayat alanları.',
    ),
  ];
}