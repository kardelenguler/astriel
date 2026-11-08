import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '../../core/http/error-message';
import { ChartSummary } from '../../core/models/saved-chart';
import { SavedChartsService } from '../../core/services/saved-charts.service';

const UNDO_SECONDS = 8;
const PAGE_SIZE = 20; // her istekte gelen harita sayısı (backend en fazla 50'ye izin veriyor)
const NAME_MAX_LENGTH = 100; // backend'deki sınırın aynısı

/** Backend'deki sıralamanın aynısı: en yeni üstte, aynı anda oluşturulanlar id'ye göre */
function newestFirst(a: ChartSummary, b: ChartSummary): number {
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? 1 : -1;
  }
  return a.id < b.id ? 1 : -1;
}

@Component({
  selector: 'app-my-charts',
  imports: [RouterLink],
  templateUrl: './my-charts.html',
  styleUrl: './my-charts.scss',
})
export class MyCharts {
  private readonly savedCharts = inject(SavedChartsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly charts = signal<ChartSummary[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly loadingMore = signal(false); // "Daha fazla yükle" isteği sürüyor mu
  /** Sunucuda henüz getirilmemiş harita kaldı mı */
  readonly hasMore = computed(() => this.charts().length < this.total());
  readonly PAGE_SIZE = PAGE_SIZE;
  readonly loadError = signal<string | null>(null);    // liste hiç yüklenemediyse
  readonly actionError = signal<string | null>(null);  // aç/sil/geri al başarısızsa
  readonly busyId = signal<string | null>(null);       // işlem süren kartın id'si
  /**
   * Geri alınabilecek silinmiş haritalar (en eskisi başta). Üst üste silinenler
   * birikir; her yeni silme süreyi baştan başlatır. Süre dolunca liste boşalır.
   */
  readonly recentlyDeleted = signal<ChartSummary[]>([]);
  /** Geri al çubuğundaki yazı: tek harita için adı, birden fazlası için sayısı */
  readonly undoMessage = computed(() => {
    const deleted = this.recentlyDeleted();
    return deleted.length === 1 ? `“${deleted[0].name}” silindi.` : `${deleted.length} harita silindi.`;
  });

  // ---------- Adlandırma ----------
  readonly editingId = signal<string | null>(null);    // adı düzenlenen kartın id'si
  readonly editName = signal('');
  readonly renameError = signal<string | null>(null);

  private undoTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.load();
    // Sayfadan çıkılınca zamanlayıcı boşta kalmasın
    this.destroyRef.onDestroy(() => clearTimeout(this.undoTimer));
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.savedCharts
      .list(PAGE_SIZE, 0) // ilk sayfa: en baştan 20 harita
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.charts.set(result.items);
          this.total.set(result.total);
          this.loading.set(false);
        },
        error: (error) => {
          this.loadError.set(getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  /** Listenin sonuna bir sonraki 20 haritayı ekler */
  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) {
      return; // çift tıklamada iki istek gitmesin, gelecek kayıt yoksa istek atılmasın
    }
    this.loadingMore.set(true);
    this.actionError.set(null);

    // offset = elimizdeki harita sayısı. Silinen haritalar listeden çıktığı için
    // bu sayı her zaman "sunucuda kaçıncı kayıttan devam edileceğini" doğru verir.
    this.savedCharts
      .list(PAGE_SIZE, this.charts().length)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.charts.update((list) => [...list, ...result.items]); // eskilerin sonuna ekle
          this.total.set(result.total);
          this.loadingMore.set(false);
        },
        error: (error) => {
          this.actionError.set(getErrorMessage(error));
          this.loadingMore.set(false);
        },
      });
  }

  /** Listeyi ilk sayfaya geri indirir (sunucuya istek atmaz) */
  showLess(): void {
    this.charts.update((list) => list.slice(0, PAGE_SIZE));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Kayıtlı haritayı kendi adresinde aç (/harita/<id>), yeniden hesaplanmaz */
  open(item: ChartSummary): void {
    this.router.navigate(['/harita', item.id]);
  }

  remove(item: ChartSummary): void {
    if (this.busyId()) {
      return;
    }
    this.busyId.set(item.id);
    this.actionError.set(null);

    this.savedCharts
      .delete(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.charts.update((list) => list.filter((c) => c.id !== item.id));
          this.total.update((t) => t - 1);
          this.busyId.set(null);
          this.showUndo(item);
        },
        error: (error) => {
          this.actionError.set(getErrorMessage(error));
          this.busyId.set(null);
        },
      });
  }

  /** Süresi dolmamış TÜM silinmiş haritaları geri getirir */
  undoDelete(): void {
    const items = this.recentlyDeleted();
    if (items.length === 0) {
      return;
    }
    clearTimeout(this.undoTimer);
    this.recentlyDeleted.set([]);
    this.actionError.set(null);

    // Her harita ayrı istekle geri alınır: biri başarısız olursa diğerleri yine gelir
    for (const item of items) {
      this.savedCharts
        .restore(item.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.putBack(item),
          error: (error) => this.actionError.set(getErrorMessage(error)),
        });
    }
  }

  // ================= Adlandırma =================

  startRename(item: ChartSummary): void {
    if (this.busyId()) {
      return;
    }
    this.editingId.set(item.id);
    this.editName.set(item.name);
    this.renameError.set(null);
    // Kutu ekrana çizildikten sonra imleci içine koy
    setTimeout(() => document.getElementById(`rename-${item.id}`)?.focus());
  }

  cancelRename(): void {
    this.editingId.set(null);
    this.renameError.set(null);
  }

  onRenameInput(event: Event): void {
    this.editName.set((event.target as HTMLInputElement).value);
    this.renameError.set(null);
  }

  saveRename(item: ChartSummary): void {
    if (this.busyId()) {
      return; // çift tıklamada iki istek gitmesin
    }

    const name = this.editName().trim();
    if (!name) {
      this.renameError.set('Haritana bir ad ver.');
      return;
    }
    if (name.length > NAME_MAX_LENGTH) {
      this.renameError.set(`Ad en fazla ${NAME_MAX_LENGTH} karakter olabilir.`);
      return;
    }
    if (name === item.name) {
      this.cancelRename(); // değişiklik yoksa isteğe gerek yok
      return;
    }

    this.busyId.set(item.id);
    this.savedCharts
      .rename(item.id, name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.charts.update((list) => list.map((c) => (c.id === item.id ? { ...c, name } : c)));
          this.busyId.set(null);
          this.cancelRename();
        },
        error: (error) => {
          this.renameError.set(getErrorMessage(error));
          this.busyId.set(null);
        },
      });
  }

  // ================= Yardımcılar =================

  /** "2005-01-26" -> "26 Ocak 2005" */
  formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00Z`));
  }

  /** "14:15:00" -> "14:15" */
  formatTime(time: string | null): string {
    return time ? time.slice(0, 5) : 'saat bilinmiyor';
  }

  /** Silinen haritayı geri alınabilecekler listesine ekler ve süreyi baştan başlatır */
  private showUndo(item: ChartSummary): void {
    clearTimeout(this.undoTimer);
    this.recentlyDeleted.update((list) => [...list, item]);
    this.undoTimer = setTimeout(() => this.recentlyDeleted.set([]), UNDO_SECONDS * 1000);
  }

  /**
   * Geri alınan haritayı listedeki eski yerine koyar. Listeyi baştan yüklemek
   * yerine böyle yapılır: "Daha fazla yükle" ile açılmış haritalar kaybolmasın.
   */
  private putBack(item: ChartSummary): void {
    this.charts.update((list) => {
      const last = list.at(-1);
      // Haritanın yeri henüz yüklenmemiş kısımdaysa eklenmez; "Daha Fazla Yükle"
      // ile zaten gelecek (eklenseydi listede iki kez görünürdü)
      if (last && this.hasMore() && newestFirst(item, last) > 0) {
        return list;
      }
      return [...list, item].sort(newestFirst);
    });
    this.total.update((t) => t + 1);
  }
}