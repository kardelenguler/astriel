import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';
import { About } from './pages/about/about';
import { Account } from './pages/account/account';
import { Chart } from './pages/chart/chart';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { MyCharts } from './pages/my-charts/my-charts';
import { NotFound } from './pages/not-found/not-found';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: Home, title: 'Astriel · Doğum Haritası' },
  { path: 'harita', component: Chart, title: 'Doğum Haritan · Astriel' },
  { path: 'hakkinda', component: About, title: 'Hakkında · Astriel' },
  { path: 'giris', component: Login, canActivate: [guestGuard], title: 'Giriş Yap · Astriel' },
  { path: 'kayit', component: Register, canActivate: [guestGuard], title: 'Kayıt Ol · Astriel' },
  {
    path: 'haritalarim',
    component: MyCharts,
    canActivate: [authGuard], // giriş yapmayan giriş sayfasına gider
    title: 'Haritalarım · Astriel',
  },
  {
    path: 'hesabim',
    component: Account,
    canActivate: [authGuard], // giriş yapmayan giriş sayfasına gider
    title: 'Hesabım · Astriel',
  },

  // Tanınmayan her adres buraya düşer. Bu satır her zaman EN SONDA olmalı.
  { path: '**', component: NotFound, title: 'Sayfa bulunamadı · Astriel' },
]; 