/**
 * Harita hesaplama istek ve yanıt tipleri.
 * Backend: app/schemas/chart.py (alan adları birebir aynı)
 */

// =============================== İSTEK ===============================
/** POST /charts/calculate gövdesi */
export interface ChartCalculateRequest {
  birth_date: string; // "1995-06-15"
  birth_time: string | null; // "14:30"; bilinmiyorsa null
  latitude: number;
  longitude: number;
  house_system?: string; // verilmezse backend "P" (Placidus) kullanır
}

// =============================== YANIT ===============================
export interface Sign {
  key: string; // "gemini" (ikon/çeviri için sabit anahtar)
  name: string; // "İkizler"
  element: 'fire' | 'earth' | 'air' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
}

/** Ev başlangıcı, yükselen veya MC */
export interface ChartPoint {
  longitude: number;
  sign: Sign;
  formatted: string; // "11°57' İkizler"
}

export interface Planet {
  key: string; // "sun", "moon", "mercury"...
  name: string; // "Güneş"
  longitude: number;
  sign: Sign;
  degree: number; // burç içindeki derece (0–30)
  formatted: string; // "24°03' İkizler"
  speed: number;
  retrograde: boolean;
  house: number | null; // doğum saati bilinmiyorsa null
}

export interface AspectType {
  key: string; // "trine"
  name: string; // "Üçgen"
  angle: number; // 120
  orb: number; // izin verilen en fazla sapma
}

export interface Aspect {
  first: string; // gezegen anahtarı, ör. "sun"
  second: string;
  type: AspectType;
  angle: number; // gerçek açı
  orb: number; // tam açıdan sapma
  applying: boolean; // true: açı tamlaşıyor
}

export interface HouseSystem {
  code: string; // "P"
  name: string; // "Placidus"
}

/** POST /charts/calculate yanıtı */
export interface ChartResponse {
  utc_datetime: string;
  utc_offset_hours: number;
  timezone: string; // "Europe/Istanbul"
  time_known: boolean;
  house_system: HouseSystem | null; // saat bilinmiyorsa null
  ascendant: ChartPoint | null;
  midheaven: ChartPoint | null;
  houses: ChartPoint[]; // 1.–12. ev; saat bilinmiyorsa boş
  planets: Planet[];
  aspects: Aspect[];
  warnings: string[]; // kullanıcıya gösterilecek Türkçe uyarılar
  engine_version: string;
}