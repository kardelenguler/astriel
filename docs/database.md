# Veritabanı

PostgreSQL kullanılır. Tablolar SQLAlchemy 2 modelleriyle (`backend/app/models/`) tanımlanır, şema değişiklikleri Alembic göçleriyle (`backend/alembic/versions/`) yapılır.

```bash
cd backend
alembic upgrade head      # tabloları oluşturur / en son sürüme getirir
```

Canlı ortamda (Render) bu komut her açılışta Dockerfile tarafından otomatik çalıştırılır.

## İlişki

```
users 1 ──── * birth_charts
```

Bir kullanıcının birden çok kayıtlı haritası olabilir. Kullanıcı silinirse haritaları da silinir (`ON DELETE CASCADE`).

## `users`

| Sütun | Tür | Not |
|---|---|---|
| `id` | UUID | Birincil anahtar |
| `username` | varchar(30) | Benzersiz, indeksli, küçük harfle saklanır |
| `email` | varchar(255), boş olabilir | Benzersiz, indeksli, isteğe bağlı |
| `hashed_password` | varchar(255) | Argon2 ile hash'lenmiş şifre; şifrenin kendisi asla saklanmaz |
| `display_name` | varchar(100), boş olabilir | |
| `is_active` | boolean | Varsayılan `true` |
| `created_at`, `updated_at` | timestamptz | Veritabanı doldurur |

## `birth_charts`

| Sütun | Tür | Not |
|---|---|---|
| `id` | UUID | Birincil anahtar |
| `user_id` | UUID | `users.id`'ye bağlı, indeksli |
| `name` | varchar(100) | Ör. "Benim haritam" |
| `birth_date` | date | |
| `birth_time` | time, boş olabilir | `NULL` = doğum saati bilinmiyor |
| `place_name` | varchar(200) | |
| `latitude` | float | `CHECK` -90…90 |
| `longitude` | float | `CHECK` -180…180 |
| `timezone` | varchar(64) | IANA adı, ör. `Europe/Istanbul` |
| `house_system` | varchar(1) | Gerçekte kullanılan ev sistemi (kutup bölgelerinde yedek sisteme geçilmiş olabilir) |
| `chart_data` | JSONB | Hesaplanmış harita: gezegenler, evler, açılar, uyarılar |
| `engine_version` | varchar(50) | Haritayı hesaplayan motorun sürümü |
| `deleted_at` | timestamptz, boş olabilir | Doluysa harita silinmiş sayılır |
| `created_at`, `updated_at` | timestamptz | Veritabanı doldurur |

## Tasarım kararları

**Hesaplanmış harita tek JSONB sütununda.** Harita her zaman doğum bilgilerinden yeniden üretilebildiği için `chart_data` bir önbellek gibidir. Gezegen, ev ve açıları ayrı tablolara bölmek şu an sorgulanmayan veriler için gereksiz karmaşıklık olurdu. İleride bu veriler üzerinde arama/istatistik gerekirse ayrı tablolara geçilebilir.

**Motor sürümü değişince otomatik yenileme.** Kayıtlı harita açılırken `engine_version` güncel sürümle aynıysa `chart_data` olduğu gibi döner. Farklıysa (ör. efemeris dosyaları veya hesaplama kodu güncellendiyse) harita doğum bilgilerinden yeniden hesaplanır ve kayıt güncellenir.

**Yumuşak silme.** Silinen harita gerçekten silinmez, `deleted_at` doldurulur. Listelerde görünmez, kullanıcı "Geri al" derse `deleted_at` tekrar `NULL` yapılır.

**Veritabanı seviyesinde kontrol.** Enlem/boylam API'de zaten doğrulanır; `CHECK` kısıtları, API doğrulaması atlansa bile hatalı verinin veritabanına girmesini engelleyen son savunma hattıdır.

**Sayfalama.** Liste `created_at DESC, id DESC` sırasıyla döner. `id`'nin eklenmesi, aynı anda kaydedilmiş iki haritanın sayfalar arasında yer değiştirmemesini sağlar.

## Göç geçmişi

| Göç | Değişiklik |
|---|---|
| `32361f4f149e` | `users` ve `birth_charts` tabloları |
| `46a9a258b2e0` | `birth_charts.deleted_at` (yumuşak silme) |
| `91e32f267b38` | `users.username` eklendi, `email` isteğe bağlı oldu |
| `9e59ccaafeca` | `engine_version` sütunu genişletildi | 