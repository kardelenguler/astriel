# Astriel: tek paket (Angular sitesi + FastAPI backend)
# Render bu dosyayı okuyup projeyi kendisi derler.

# ================= 1. Aşama: Angular sitesini derle =================
FROM node:22-slim AS frontend
WORKDIR /frontend

# Önce sadece paket listeleri: kod değişse bile paketler yeniden indirilmez (hızlı derleme)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npx ng build


# ================= 2. Aşama: Python backend =================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    FRONTEND_DIST=/app/frontend_dist

WORKDIR /app

# Derleme araçları sadece paket kurulumu için gerekiyorsa kurulup hemen silinir
COPY backend/requirements.txt ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y build-essential \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY backend/ ./
COPY --from=frontend /frontend/dist/frontend/browser ./frontend_dist

# Güvenlik: uygulama yönetici (root) olarak çalışmasın
RUN useradd --create-home astriel && chown -R astriel /app
USER astriel

EXPOSE 8000

# 1) Veritabanı tablolarını güncelle  2) Sunucuyu başlat
# --proxy-headers: Render'ın önündeki ara sunucu yüzünden gerçek kullanıcı IP'si
# başlıkta gelir; giriş denemesi sınırının doğru çalışması için bunu okuruz.
# --no-access-log: istek adresleri (/harita?tarih=...) doğum bilgisi içerdiği için loglanmaz. 
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --no-access-log --proxy-headers --forwarded-allow-ips='*'"] 