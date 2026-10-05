import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { GUIDE_SYMBOLS } from '../../../core/content/guides/guide-facts';
import { GuideCollection } from '../../../core/models/guide';

/** Rehber listesi: /evler veya /burclar. Hangi grubun gösterileceği rotadan gelir. */
@Component({
  selector: 'app-guide-list',
  imports: [RouterLink],
  templateUrl: './guide-list.html',
  styleUrl: '../guide.scss',
})
export class GuideList {
  protected readonly collection: GuideCollection =
    inject(ActivatedRoute).snapshot.data['collection'];
  protected readonly symbols = GUIDE_SYMBOLS;
}