/**
 * Bir ev, nokta (Güneş, Ay, Yükselen) ya da gezegen için gösterilen yorum.
 * Sayfa yorumun nereden geldiğini bilmez; sadece bu yapıyı gösterir.
 * Böylece ileride yapay zekâ yorumları aynı ekranda kullanılabilir.
 */
export type InterpretationSource = 'static' | 'ai';

export interface Interpretation {
  id: string;           // "house-1", "point-sun", "planet-mercury"
  title: string;        // "1. Ev · Benlik"
  keywords: string;     // "Benlik · Kendini ifade etme"
  position: string;     // "29°39' İkizler"
  description: string;  // evin/noktanın/gezegenin genel anlamı
  heading: string;      // "İkizler'de 1. Ev"
  text: string;         // burç birleşimi
  notes?: string[];     // ek paragraflar (ev yerleşimi, retro notu gibi)
  source: InterpretationSource;
}