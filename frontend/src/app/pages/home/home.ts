import { Component, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Place } from '../../core/models/place';
import { BirthForm, BirthFormValue } from '../../shared/birth-form/birth-form';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // 1995-06-15
const TIME_PATTERN = /^\d{2}:\d{2}$/; // 14:30

@Component({
  selector: 'app-home',
  imports: [BirthForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** "Bilgileri değiştir" ile gelindiyse formu dolduracak değer (yoksa null) */
  protected readonly initialValue = this.readInitialValue();

  constructor() {
    // Bilgiler dolu geldiyse sayfa doğrudan forma kaysın
    if (this.initialValue) {
      afterNextRender(() => this.scrollToForm());
    }
  }

  // Form gönderilince bilgileri adres çubuğuna koyup sonuç sayfasına git
  onBirthFormSubmit(value: BirthFormValue): void {
    this.router.navigate(['/harita'], {
      queryParams: {
        tarih: value.birthDate,
        saat: value.birthTime ?? undefined, // saat bilinmiyorsa adrese hiç eklenmesin
        enlem: value.place.latitude,
        boylam: value.place.longitude,
        yer: value.place.name,
      },
    });
  }

  // Alttaki düğmeye basınca sayfa yukarıdaki forma yumuşakça kaysın
  scrollToForm(): void {
    document.getElementById('dogum-formu')?.scrollIntoView({ behavior: 'smooth' });
  }

  /** Adresteki bilgileri okur; eksik ya da bozuksa null (form boş açılır) */
  private readInitialValue(): BirthFormValue | null {
    const params = this.route.snapshot.queryParamMap;
    const date = params.get('tarih');
    const time = params.get('saat');
    const name = params.get('yer')?.trim();
    const latitude = Number(params.get('enlem'));
    const longitude = Number(params.get('boylam'));

    const valid =
      date !== null &&
      DATE_PATTERN.test(date) &&
      (time === null || TIME_PATTERN.test(time)) &&
      !!name &&
      params.has('enlem') &&
      params.has('boylam') &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180;

    if (!valid) {
      return null;
    }

    const place = { name, display_name: name, latitude, longitude, country: '' } as Place;
    return { birthDate: date, birthTime: time, place };
  }
}