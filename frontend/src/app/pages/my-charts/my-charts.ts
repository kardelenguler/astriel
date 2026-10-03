import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '../../core/http/error-message';
import { ChartSummary } from '../../core/models/saved-chart';
import { SavedChartsService } from '../../core/services/saved-charts.service';

const UNDO_SECONDS = 8;
const NAME_MAX_LENGTH = 100; // YENİ (adlandırma): backend'deki sınırın aynısı

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
  readonly loadError = signal<string | null>(null);    // liste hiç yüklenemediyse
  readonly actionError = signal<string | null>(null);  // aç/sil/geri al başarısızsa
  readonly busyId = signal<string | null>(null);       // işlem süren kartın id'si
  readonly lastDeleted = signal<ChartSummary | null>(null);

  // ---------- YENİ (adlandırma) ----------
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
      .list()
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

  /** Kayıtlı haritanın bilgilerini alıp harita sayfasında aç */
  open(item: ChartSummary): void {
    if (this.busyId()) {
      return;
    }
    this.busyId.set(item.id);
    this.actionError.set(null);

    this.savedCharts
      .get(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) =>
          this.router.navigate(['/harita'], {
            queryParams: {
              tarih: saved.birth_date,
              saat: saved.birth_time?.slice(0, 5) ?? undefined, // "14:15:00" -> "14:15"
              enlem: saved.latitude,
              boylam: saved.longitude,
              yer: saved.place_name,
            },
          }),
        error: (error) => {
          this.actionError.set(getErrorMessage(error));
          this.busyId.set(null);
        },
      });
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

  undoDelete(): void {
    const item = this.lastDeleted();
    if (!item) {
      return;
    }
    clearTimeout(this.undoTimer);
    this.lastDeleted.set(null);

    this.savedCharts
      .restore(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(), // doğru sırada görünsün diye listeyi yeniden al
        error: (error) => this.actionError.set(getErrorMessage(error)),
      });
  }

  // ================= YENİ (adlandırma) =================

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

  private showUndo(item: ChartSummary): void {
    clearTimeout(this.undoTimer);
    this.lastDeleted.set(item);
    this.undoTimer = setTimeout(() => this.lastDeleted.set(null), UNDO_SECONDS * 1000);
  }
} 