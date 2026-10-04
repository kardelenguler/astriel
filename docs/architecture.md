# Mimari

Astriel; Angular ile yazılmış bir arayüz, FastAPI ile yazılmış bir API ve PostgreSQL veritabanından oluşur. Canlı ortamda ikisi tek bir Docker imajında çalışır: FastAPI hem `/api/v1` altındaki API'yi hem de derlenmiş Angular sitesini aynı adresten sunar.

```
Tarayıcı (Angular)
      │  HTTP / JSON
      ▼
FastAPI ── /api/v1 ──► Servisler ──► Repository'ler ──► PostgreSQL
      │                    │
      │                    ├──► Hesaplama motoru (Swiss Ephemeris)
      │                    └──► Geocoder ──► OpenStreetMap Nominatim
      └── diğer adresler ──► Angular'ın index.html'i
```

## Backend katmanları

Her katmanın tek bir sorumluluğu vardır ve sadece bir alttakini tanır.

```
backend/app/
├── api/            HTTP katmanı
│   ├── v1/routes/  Uç noktalar: isteği alır, servise verir, yanıtı döner
│   ├── deps.py     Bağımlılık enjeksiyonu (oturum, servisler, giriş yapmış kullanıcı)
│   └── exception_handlers.py   Tüm hataları ortak JSON biçimine çevirir
├── services/       İş kuralları (kayıt, giriş, harita kaydetme, yeniden hesaplama)
├── repositories/   Veritabanı sorguları (SQLAlchemy); servisler SQL bilmez
├── models/         Veritabanı tabloları (SQLAlchemy ORM)
├── schemas/        İstek/yanıt modelleri ve doğrulama (Pydantic v2)
├── astro/          Hesaplama motoru: saat dönüşümü, gezegenler, evler, açılar, burçlar
├── clients/        Dış servisler (Nominatim); projenin geri kalanı servisi tanımaz
├── core/           Ayarlar (.env), güvenlik (Argon2, JWT), loglama, hata sınıfları, deneme sınırı
└── db/             Veritabanı bağlantısı ve ortak model sınıfı
```

**Neden bu ayrım:** Route'lar ince kalır, iş kuralları tek yerde toplanır. Servisler `Depends` ile verildiği için testlerde gerçek veritabanı yerine test veritabanı, gerçek Nominatim yerine sahte bir geocoder kolayca takılabilir. Nominatim başka bir sağlayıcıyla değiştirilirse sadece `clients/geocoder.py` değişir.

## Hesaplama akışı

1. **Saat dilimi:** Doğum yerinin koordinatından `timezonefinder` ile bulunur; kullanıcıya sorulmaz.
2. **UTC'ye çevirme:** `zoneinfo` ile, o tarihteki yaz saati kuralları dahil. Yaz saati geçişinde hiç yaşanmamış veya iki kez yaşanmış saatler ayrıca ele alınır.
3. **Jülyen günü:** UTC zamanı Swiss Ephemeris'in kullandığı gün sayısına çevrilir.
4. **Evler:** Seçilen ev sistemiyle yükselen, MC ve 12 ev başlangıcı hesaplanır. Kutup enlemlerinde Placidus/Koch tanımsız olduğundan yedek sisteme geçilir ve kullanıcı uyarılır.
5. **Gezegenler:** 10 gezegen, Kuzey Ay Düğümü ve Chiron; burç, derece, ev ve geri hareket bilgisiyle.
6. **Açılar:** Kavuşum, karşıt, üçgen, kare, altmışlık; orb ve yaklaşan/ayrılan bilgisiyle.

Doğum saati bilinmiyorsa gezegenler öğle saatine göre hesaplanır, evler ve yükselen hesaplanmaz. Ay o gün burç değiştiriyorsa kullanıcı uyarılır.

## Frontend yapısı

```
frontend/src/app/
├── core/
│   ├── services/   API ile konuşan servisler (auth, chart, saved-charts, places, interpretation)
│   ├── http/       Token ekleyen interceptor, hata mesajı çevirici
│   ├── guards/     Giriş gerektiren / sadece misafire açık sayfalar
│   ├── models/     Backend yanıtlarının TypeScript karşılıkları
│   └── content/    Burç, gezegen, ev ve nokta açıklama metinleri
├── pages/          Sayfalar (ana sayfa, harita, haritalarım, giriş, kayıt, hesabım, hakkında)
├── shared/         Tekrar kullanılan bileşenler (doğum formu, burç çarkı, yorum paneli)
└── layout/         Üst menü ve alt bilgi
```

- Standalone bileşenler ve **signals** kullanılır; durum `signal`, türetilen değerler `computed` ile tutulur.
- Arayüz kütüphanesi yoktur; tüm stiller SCSS ile projeye özel yazılmıştır.
- Harita sayfası iki şekilde açılır: `/harita?tarih=...` adresteki bilgilerle hesaplar (paylaşılabilir bağlantı), `/harita/:id` kayıtlı haritayı veritabanındaki haliyle gösterir.

## Güvenlik

- Şifreler Argon2 ile hash'lenir; oturum JWT ile tutulur.
- Gizli bilgiler (`SECRET_KEY`, veritabanı adresi) `.env` dosyasında durur ve depoya eklenmez.
- Giriş denemeleri kullanıcı adı + IP başına sınırlandırılır.
- Kullanıcı sadece kendi haritalarına erişebilir; başkasının haritası için `404` döner.
- Loglara şifre ve doğum tarihi gibi kişisel veriler yazılmaz.

## Testler

- **Backend:** `pytest` ile unit testler (hesaplama motoru, şemalar, güvenlik) ve ayrı bir PostgreSQL test veritabanı kullanan integration testler (API, servisler, repository'ler).
- **Frontend:** Vitest ile bileşen ve servis testleri.

## Yayın

`Dockerfile` iki aşamalıdır: önce Angular derlenir, sonra Python imajına kopyalanır. Render her `git push` sonrası imajı yeniden oluşturur; açılışta `alembic upgrade head` ile veritabanı güncellenir, sonra `uvicorn` başlar. Veritabanı Neon (yönetilen PostgreSQL) üzerindedir.