# ASTRIEL
> 🚧 Proje aktif olarak geliştirilmektedir.

Swiss Ephemeris ile gerçek gök hesabı yapan, full-stack bir doğum haritası web uygulaması.

**Canlı:** https://astriel.onrender.com

Astriel, hazır burç API'lerine bağlı değildir. Doğum tarihi, saati ve yerinden
gezegen konumlarını, yükseleni, MC'yi, 12 evi ve açıları kendi hesaplama motoruyla üretir.
Saat dilimi kullanıcıya sorulmaz; doğum yerinin koordinatından bulunur ve geçmişteki
yaz saati kuralları dahil doğru şekilde UTC'ye çevrilir.

## Özellikler

- **Doğum haritası hesaplama:** 10 gezegen, Kuzey Ay Düğümü, Chiron, yükselen, MC ve 12 ev
- **6 ev sistemi:** Placidus, Koch, Whole Sign, Equal, Porphyry, Regiomontanus (API'den seçilebilir; site Placidus kullanır)
- **Açılar:** kavuşum, karşıt, üçgen, kare, altmışlık; yaklaşan/ayrılan bilgisiyle
- **Doğum saati bilinmiyorsa:** gezegenler öğle saatine göre hesaplanır, Ay o gün burç
  değiştiriyorsa kullanıcı uyarılır
- **Zor durumlar:** yaz saati geçişinde hiç yaşanmamış veya iki kez yaşanmış saatler ile
  kutup enlemlerinde Placidus/Koch'un tanımsız olması ayrıca ele alınır
- **Doğum yeri arama:** OpenStreetMap (Nominatim), kullanım kurallarına uygun hız sınırı
  ve önbellekle
- **Misafir kullanım:** kayıt olmadan harita hesaplanıp görüntülenebilir
- **Hesap sistemi:** kayıt olan kullanıcı haritalarını kaydedebilir, adlandırabilir,
  silebilir ve silmeyi geri alabilir
- **Harita çarkı:** SVG ile çizilen, birbirine yakın gezegenleri otomatik ayıran burç çarkı
- **Yorumlar:** Güneş, Ay, Yükselen, gezegenler ve 12 ev için açıklamalar
- **Güvenlik:** şifre değişince diğer oturumlar kapanır; giriş ve yer aramada istek sınırı vardır
- **Gizlilik:** doğum bilgileri loglara ve ziyaretçi sayacına gitmez; silinen haritalar 30 gün sonra kalıcı olarak silinir

## Kullanılan Teknolojiler

**Backend**
- Python, FastAPI
- PostgreSQL, SQLAlchemy 2 (ORM), Alembic (veritabanı göçleri)
- Pydantic v2 ve pydantic-settings (doğrulama ve `.env` ayarları)
- Swiss Ephemeris (`pysweph`): gezegen ve ev hesapları
- timezonefinder + zoneinfo: koordinattan saat dilimi ve tarihsel yaz saati kuralları
- Argon2 (`pwdlib`) ile şifre hash'leme, JWT (`PyJWT`) ile oturum
- pytest: unit ve integration testleri (`requirements-dev.txt`)

**Frontend**
- Angular 22 (standalone bileşenler, signals)
- TypeScript
- SCSS: arayüz kütüphanesi yok, tüm tasarım projeye özel yazıldı
- SVG ile çizilen burç çarkı
- Vitest: bileşen ve servis testleri

**Dış servis**
- OpenStreetMap Nominatim: doğum yeri arama

**Yayın**
- Docker, Render (uygulama), Neon (PostgreSQL)

## Kurulum

### Gereksinimler
- Python 3.12
- Node.js ve npm
- PostgreSQL

### 1. Veritabanları
PostgreSQL'de iki veritabanı oluştur: biri uygulama, biri testler için.

```sql
CREATE DATABASE astriel;
CREATE DATABASE astriel_test;
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows (birden fazla Python kuruluysa: py -3.12 -m venv .venv)
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements-dev.txt
```

`.env.example` dosyasını `.env` adıyla kopyala ve içindeki değerleri doldur
(veritabanı şifresi, `SECRET_KEY`, `GEOCODER_USER_AGENT`).

**Efemeris dosyaları:** 1800–2400 yıllarını kapsayan Swiss Ephemeris dosyaları
(`sepl_18.se1` gezegenler, `semo_18.se1` Ay, `seas_18.se1` Chiron) depoda
`backend/ephemeris/` klasöründe hazır gelir; ayrıca indirmen gerekmez.

Veritabanı tablolarını oluştur ve sunucuyu başlat:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API dokümantasyonu: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Uygulama: http://localhost:4200

### Testler

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

Veritabanı gerektiren backend testleri `.env` içindeki `TEST_DATABASE_URL` adresini kullanır.
Bu değer tanımlı değilse o testler atlanır.

## Dokümantasyon

- [API](docs/api.md): uç noktalar, hata biçimi, doğrulama kuralları
- [Mimari](docs/architecture.md): katmanlar, hesaplama akışı, güvenlik
- [Veritabanı](docs/database.md): tablolar ve tasarım kararları

## Yol Haritası

- [x] Swiss Ephemeris ile harita hesaplama motoru
- [x] Kayıt, giriş ve harita kaydetme
- [x] Burç çarkı ve temel yorumlar (Güneş, Ay, Yükselen, gezegenler, 12 ev)
- [x] Kayıtlı haritalarda sayfalama ve kalıcı harita adresleri
- [ ] Gezegen + burç + ev kombinasyonlarından kural tabanlı yorum motoru
- [ ] Yapay zekâ ile kişiye özel harita yorumları
- [ ] Günlük ve haftalık burç yorumları

## Lisans

[GNU AGPL-3.0](LICENSE). Astriel, AGPL lisanslı Swiss Ephemeris'i (Astrodienst AG) kullandığı
için kaynak kodu da aynı lisansla açıktır.