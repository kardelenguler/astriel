import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BirthForm, BirthFormValue } from '../../shared/birth-form/birth-form';

@Component({
  selector: 'app-home',
  imports: [BirthForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);

  // Form gönderilince bilgileri adres çubuğuna koyup sonuç sayfasına git
  onBirthFormSubmit(value: BirthFormValue): void {
    this.router.navigate(['/harita'], {
      queryParams: {
        tarih: value.birthDate,
        saat: value.birthTime ?? undefined,  // saat bilinmiyorsa adrese hiç eklenmesin
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
} 