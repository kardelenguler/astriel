/**
 * İlerletilmiş harita istek ve yanıt tipleri.
 * Backend: app/schemas/chart.py -> ProgressedRequest / ProgressedResponse
 */
import { ChartCalculateRequest, ChartResponse, Sign } from './chart';

/** POST /charts/progressed gövdesi */
export interface ProgressedRequest extends ChartCalculateRequest {
  target_date: string; // "2026-10-18": haritanın hesaplanacağı tarih (doğumdan sonra)
}

/** İlerletilmiş Ay'ın bir sonraki burç değişimi */
export interface MoonSignChange {
  change_date: string; // gerçek takvimde tarih, "2027-03-02"
  sign: Sign; // geçeceği burç
}

export interface ProgressedResponse {
  target_date: string;
  age_years: number; // hedef tarihteki yaş (ondalıklı)
  chart: ChartResponse; // chart.utc_datetime = ilerletilmiş AN (gerçek tarih değil)
  next_moon_sign_change: MoonSignChange;
}