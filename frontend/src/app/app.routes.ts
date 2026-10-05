import { Routes } from '@angular/router';

import { HOUSE_GUIDES } from './core/content/guides/house-guides';
import { SIGN_GUIDES } from './core/content/guides/sign-guides';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { About } from './pages/about/about';
import { Account } from './pages/account/account';
import { Chart } from './pages/chart/chart';
import { GuideHub } from './pages/guide/guide-hub/guide-hub';
import { guideRoutes } from './pages/guide/guide.routes';
import { HouseDetail } from './pages/guide/house-detail/house-detail';
import { SignDetail } from './pages/guide/sign-detail/sign-detail';
import { Home } from './pages/home/home';
import { Privacy } from './pages/legal/privacy';
import { Terms } from './pages/legal/terms';
import { Login } from './pages/login/login';
import { MyCharts } from './pages/my-charts/my-charts';
import { NotFound } from './pages/not-found/not-found';
import { Register } from './pages/register/register';

// data.description: Google arama sonucunda başlığın altında görünen açıklama
// (DescriptionService yazar). Yazılmayan sayfalarda varsayılan açıklama kullanılır.
export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Astriel · Doğum Haritası',
    data: {
      description:
        'Doğum haritanı ücretsiz hesapla: yükselen burcunu, Ay burcunu, gezegen konumlarını, 12 evi ve açıları gerçek gök hesabıyla öğren. Kayıt gerekmez.',
    },
  },
  { path: 'harita', component: Chart, title: 'Doğum Haritan · Astriel' },
  // Kayıtlı harita (/harita/<id>), sadece sahibine açılır
  {
    path: 'harita/:id',
    component: Chart,
    canActivate: [authGuard],
    title: 'Kayıtlı Haritan · Astriel',
  },
  {
    path: 'hakkinda',
    component: About,
    title: 'Hakkında · Astriel',
    data: {
      description:
        'Astriel nedir, doğum haritası nasıl hesaplanır? Gezegen konumlarının Swiss Ephemeris ile nasıl bulunduğunu öğren.',
    },
  },
  {
    path: 'gizlilik',
    component: Privacy,
    title: 'Gizlilik Politikası · Astriel',
    data: {
      description: 'Astriel hangi bilgileri saklar, nasıl korur ve onları nasıl silebilirsin?',
    },
  },
  {
    path: 'kullanim-sartlari',
    component: Terms,
    title: 'Kullanım Şartları · Astriel',
    data: { description: "Astriel'i kullanma koşulları." },
  },
  // Rehber: /rehber, /evler, /evler/7-ev, /burclar, /burclar/akrep
  {
    path: 'rehber',
    component: GuideHub,
    title: 'Astroloji Rehberi · Astriel',
    data: {
      description:
        'Doğum haritasını okumayı öğren: 12 burcun ve 12 evin anlamı, elementleri, yönetici gezegenleri ve haritandaki yerleri.',
    },
  },
  ...guideRoutes(HOUSE_GUIDES, HouseDetail),
  ...guideRoutes(SIGN_GUIDES, SignDetail),
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