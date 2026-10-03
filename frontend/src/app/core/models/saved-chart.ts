import { ChartCalculateRequest, ChartResponse, Sign } from './chart';

// POST /charts isteği: hesaplama bilgileri + haritanın adı ve yer adı
export interface ChartCreateRequest extends ChartCalculateRequest {
  name: string;        // 1–100 karakter
  place_name: string;  // 1–200 karakter
}

// Listedeki bir satır (backend: ChartSummaryOut)
export interface ChartSummary {
  id: string;
  name: string;
  birth_date: string;          // "2005-01-26"
  birth_time: string | null;   // "14:15:00" (saniyeli gelir)
  place_name: string;
  sun_sign: Sign;
  moon_sign: Sign;
  ascendant_sign: Sign | null; // saat bilinmiyorsa null
  created_at: string;
}

// Sayfalı liste (backend: ChartListOut)
export interface ChartList {
  items: ChartSummary[];
  total: number;
  limit: number;
  offset: number;
}

// Tek bir kayıtlı haritanın tamamı (backend: SavedChartOut)
export interface SavedChart {
  id: string;
  name: string;
  place_name: string;
  birth_date: string;
  birth_time: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  chart: ChartResponse;
} 