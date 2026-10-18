/**
 * Solar Return (Güneş dönüşü) istek ve yanıt tipleri.
 * Backend: app/schemas/chart.py -> SolarReturnRequest / SolarReturnResponse
 */
import { ChartCalculateRequest, ChartResponse } from './chart';

/** POST /charts/solar-return gövdesi */
export interface SolarReturnRequest extends ChartCalculateRequest {
  year: number; // Güneş dönüşü hesaplanacak yıl (doğum yılından sonra)
  // İkisi birlikte verilir; verilmezse harita doğum yerine göre çıkarılır
  return_latitude?: number;
  return_longitude?: number;
}

export interface SolarReturnResponse {
  year: number;
  used_birth_place: boolean; // true: doğum yerine göre, false: bulunulan yere göre
  chart: ChartResponse; // chart.utc_datetime = Güneş dönüşü anı
}