/** Bir noktanın yorum metinleri */
export interface PointTexts {
  /** Burç anahtarına göre (aries, taurus, ...): yaklaşık 3 cümle */
  signs: Record<string, string>;
  /** Ev numarasına göre (1–12): yaklaşık 2 cümle */
  houses: Record<number, string>;
}