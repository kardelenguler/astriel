import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { GUIDE_FACTS, GUIDE_SYMBOLS } from '../../../core/content/guides/guide-facts';
import { GuideCollection } from '../../../core/models/guide';
import { findGuide } from '../find-guide';

/** Tek rehber sayfası: /evler/7-ev, /burclar/akrep */
@Component({
  selector: 'app-guide-detail',
  imports: [RouterLink],
  templateUrl: './guide-detail.html',
  styleUrl: '../guide.scss',
})
export class GuideDetail {
  private readonly route = inject(ActivatedRoute);

  protected readonly collection: GuideCollection = this.route.snapshot.data['collection'];

  // /evler/1-ev'den /evler/2-ev'e geçince sayfa yeniden oluşturulmaz, sadece adres değişir.
  // Bu yüzden adres bir signal olarak izlenir; içerik kendiliğinden güncellenir.
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly index = computed(() =>
    this.collection.items.findIndex((item) => item.slug === this.params().get('slug')),
  );

  protected readonly guide = computed(() => findGuide(this.collection, this.params().get('slug')));
  protected readonly facts = computed(() => GUIDE_FACTS[this.params().get('slug') ?? ''] ?? []);
  protected readonly symbol = computed(() => GUIDE_SYMBOLS[this.params().get('slug') ?? ''] ?? '');
  protected readonly previous = computed(() => this.collection.items[this.index() - 1]);
  protected readonly next = computed(() => this.collection.items[this.index() + 1]);
}