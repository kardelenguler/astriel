import { Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { getErrorMessage } from '../../core/http/error-message';
import { Place } from '../../core/models/place';
import { PlacesService } from '../../core/services/places.service';

/** Backend'in desteklediği yıl aralığı (backend: ephemeris.py MIN_YEAR / MAX_YEAR) */
const MIN_YEAR = 1801;
const MAX_YEAR = 2398;

/** Tarih "YYYY-AA-GG" biçimindedir; yılı desteklenen aralıkta mı? */
function birthYearValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null; // boşluk kontrolünü Validators.required yapar
  }
  const year = Number(value.slice(0, 4));
  return year >= MIN_YEAR && year <= MAX_YEAR ? null : { yearRange: true };
}

/** Form gönderildiğinde dışarıya verilen değer */
export interface BirthFormValue {
  birthDate: string; // "1995-06-15"
  birthTime: string | null; // "14:30" veya saat bilinmiyorsa null
  place: Place; // listeden SEÇİLEN yer (koordinatıyla birlikte)
}

/**
 * Doğum bilgisi formu: tarih, saat ("bilmiyorum" seçeneğiyle) ve doğum yeri.
 * Ana sayfada ve harita sayfasında kullanılır.
 */
@Component({
  selector: 'app-birth-form',
  imports: [ReactiveFormsModule],
  templateUrl: './birth-form.html',
  styleUrl: './birth-form.scss',
})
export class BirthForm {
  private readonly fb = inject(FormBuilder);
  private readonly placesService = inject(PlacesService);
  private readonly destroyRef = inject(DestroyRef);

  /** YENİ: "Bilgileri değiştir" ile gelindiyse formun önceden doldurulacağı değer */
  readonly initialValue = input<BirthFormValue | null>(null);

  /** Form geçerli şekilde gönderilince tetiklenir; kullanan component dinler */
  readonly submitted = output<BirthFormValue>();

  /** Alanlar ve kuralları (backend'deki Pydantic şemasının karşılığı) */
  readonly form = this.fb.nonNullable.group({
    birthDate: ['', [Validators.required, birthYearValidator]],
    birthTime: ['', Validators.required],
    unknownTime: [false],
    placeQuery: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  // ---------- Yer arama durumu ----------
  // signal: değeri değişince ekranın ilgili kısmı kendiliğinden güncellenir
  readonly places = signal<Place[] | null>(null); // null = henüz aranmadı / liste kapalı
  readonly selectedPlace = signal<Place | null>(null);
  readonly searching = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly placeNotSelected = signal(false);

  constructor() {
    // "Saatimi bilmiyorum" işaretlenince saat alanını kapat (kapalı alan doğrulanmaz)
    this.form.controls.unknownTime.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((unknown) => {
        const time = this.form.controls.birthTime;
        if (unknown) {
          time.reset();
          time.disable();
        } else {
          time.enable();
        }
      });

    // Kullanıcı bir yer seçtikten sonra yazıyı değiştirirse seçim geçersiz olur
    this.form.controls.placeQuery.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const selected = this.selectedPlace();
        if (selected && value !== selected.display_name) {
          this.selectedPlace.set(null);
        }
      });

    // YENİ: başlangıç değeri verildiyse formu doldur
    effect(() => {
      const value = this.initialValue();
      if (value) {
        untracked(() => this.fill(value));
      }
    });
  }

  /** Bir alanda gösterilecek hata var mı? (kullanıcı alana dokunduktan sonra) */
  hasError(field: 'birthDate' | 'birthTime' | 'placeQuery', error: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
  }

  /** Sadece kullanıcı 🔍'ye ya da Enter'a basınca çağrılır (Nominatim kuralı) */
  searchPlaces(): void {
    const control = this.form.controls.placeQuery;
    control.markAsTouched();
    if (control.invalid || this.searching()) {
      return; // boş/kısa arama backend'e hiç gitmez; üst üste basılırsa tek istek
    }

    this.searching.set(true);
    this.searchError.set(null);
    this.placeNotSelected.set(false);
    this.places.set(null);

    this.placesService
      .search(control.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (places) => {
          this.places.set(places);
          this.searching.set(false);
        },
        error: (error) => {
          this.searchError.set(getErrorMessage(error));
          this.searching.set(false);
        },
      });
  }

  selectPlace(place: Place): void {
    this.selectedPlace.set(place); // ÖNCE seçim, sonra yazı (yukarıdaki dinleyici seçimi silmesin)
    this.form.controls.placeQuery.setValue(place.display_name);
    this.places.set(null); // listeyi kapat
    this.placeNotSelected.set(false);
  }

  /** Yer kutusunda Enter: formu göndermek yerine arama yap */
  onPlaceEnter(event: Event): void {
    event.preventDefault();
    this.searchPlaces();
  }

  onSubmit(): void {
    const place = this.selectedPlace();
    if (this.form.invalid || !place) {
      this.form.markAllAsTouched();
      // Yer yazılmış ama listeden seçilmemişse ayrıca uyar
      this.placeNotSelected.set(!place && this.form.controls.placeQuery.valid);
      return;
    }

    const { birthDate, birthTime, unknownTime } = this.form.getRawValue();
    this.submitted.emit({
      birthDate,
      birthTime: unknownTime ? null : birthTime,
      place,
    });
  }

  /** YENİ: formu verilen bilgilerle doldurur (yer de seçili gelir, tekrar aramak gerekmez) */
  private fill(value: BirthFormValue): void {
    this.form.controls.birthDate.setValue(value.birthDate);
    if (value.birthTime) {
      this.form.controls.unknownTime.setValue(false);
      this.form.controls.birthTime.setValue(value.birthTime);
    } else {
      this.form.controls.unknownTime.setValue(true); // saat alanını da kapatır
    }
    this.selectPlace(value.place);
  }
} 