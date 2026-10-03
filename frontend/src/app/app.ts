import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { CanonicalService } from './core/services/canonical.service';
import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    // Sayfa açılınca/yenilenince kayıtlı oturumu geri yükle
    inject(AuthService).restoreSession();
    // Her sayfada Google için doğru canonical adresi
    inject(CanonicalService).init();
  }
} 