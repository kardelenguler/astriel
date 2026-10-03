# API

Tüm adresler `/api/v1` ile başlar. Uygulama çalışırken etkileşimli dokümantasyon:
`http://localhost:8000/docs` (Swagger UI).

## Kimlik doğrulama

Giriş gerektiren isteklerde başlığa token eklenir:

```
Authorization: Bearer <access_token>
```

Token `POST /auth/login` ile alınır ve `.env` içindeki `ACCESS_TOKEN_EXPIRE_MINUTES` kadar geçerlidir.

## Uç noktalar

| Yöntem | Adres | Giriş | Açıklama |
|---|---|---|---|
| GET | `/health` | – | Sunucu ve veritabanı durumu (veritabanına ulaşılamazsa 503) |
| POST | `/auth/register` | – | Yeni hesap oluşturur (201) |
| POST | `/auth/login` | – | Giriş yapar, token döner. **Form verisi** alır (`username`, `password`) |
| GET | `/auth/me` | ✓ | Giriş yapmış kullanıcının bilgileri |
| POST | `/account/password` | ✓ | Şifreyi değiştirir (204) |
| DELETE | `/account` | ✓ | Hesabı ve tüm haritaları kalıcı olarak siler (204) |
| POST | `/charts/calculate` | – | Haritayı hesaplar, **kaydetmez** (misafir de kullanabilir) |
| POST | `/charts` | ✓ | Haritayı hesaplar ve kaydeder (201) |
| GET | `/charts?limit=20&offset=0` | ✓ | Kayıtlı haritalar, en yeni üstte. `limit` en fazla 50 |
| GET | `/charts/{id}` | ✓ | Kayıtlı haritanın tamamı (yeniden hesaplanmaz) |
| PATCH | `/charts/{id}` | ✓ | Haritanın adını değiştirir |
| DELETE | `/charts/{id}` | ✓ | Haritayı siler, geri alınabilir (204) |
| POST | `/charts/{id}/restore` | ✓ | Silinen haritayı geri getirir |
| GET | `/places/search?q=Antalya` | – | Yer adından koordinat bulur (OpenStreetMap Nominatim) |

Bir kullanıcı başkasının haritasına erişmeye çalışırsa `404` döner; haritanın var olup olmadığı bile belli edilmez.

## Örnek: Harita hesaplama

```http
POST /api/v1/charts/calculate
Content-Type: application/json

{
  "birth_date": "2005-01-26",
  "birth_time": "14:15",
  "latitude": 36.8969,
  "longitude": 30.7133,
  "house_system": "P"
}
```

- `birth_time` gönderilmezse veya `null` ise saat bilinmiyor sayılır: gezegenler öğle saatine göre hesaplanır, yükselen ve evler hesaplanmaz.
- `house_system` isteğe bağlıdır. Varsayılan `P` (Placidus). Diğerleri: `K` Koch, `W` Whole Sign, `E` Equal, `O` Porphyry, `R` Regiomontanus.
- Saat dilimi gönderilmez; koordinattan bulunur.

Yanıtta UTC zamanı, saat dilimi, gezegenler, yükselen, MC, 12 ev, açılar ve varsa uyarılar bulunur.

## Doğrulama kuralları

| Alan | Kural |
|---|---|
| `username` | 3–30 karakter; İngilizce harf, rakam, `_`. Küçük harfe çevrilir |
| `password` | 8–128 karakter |
| `email` | İsteğe bağlı, geçerli e-posta |
| `latitude` / `longitude` | -90…90 / -180…180 |
| `name` (harita) | 1–100 karakter |
| `place_name` | 1–200 karakter |

## Hata biçimi

Tüm hatalar aynı biçimde döner:

```json
{
  "error": {
    "code": "invalid_input",
    "message": "Kullanıcıya gösterilecek Türkçe mesaj",
    "fields": [{ "field": "latitude", "message": "..." }]
  }
}
```

`fields` sadece form doğrulama hatalarında bulunur.

| Durum | `code` | Ne zaman |
|---|---|---|
| 401 | `unauthorized` | Token yok/geçersiz veya kullanıcı adı/şifre hatalı |
| 403 | `forbidden` | İzin olmayan işlem |
| 404 | `not_found` | Kayıt bulunamadı |
| 409 | `conflict` | Kullanıcı adı veya e-posta zaten kayıtlı |
| 422 | `invalid_input` | Geçersiz giriş |
| 429 | `too_many_requests` | Çok fazla hatalı giriş denemesi |
| 500 | `calculation_error` | Harita hesaplanamadı |
| 503 | `service_unavailable` | Yer arama servisine veya veritabanına ulaşılamıyor |

## Giriş deneme sınırı

Aynı kullanıcı adı + IP adresi için 5 dakika içinde 5 hatalı giriş yapılırsa giriş geçici olarak engellenir (`429`). Başarılı giriş sayacı sıfırlar. Sayaçlar bellekte tutulur; birden fazla sunucuya geçilirse Redis gibi ortak bir depoya taşınmalıdır. 