/**
 * Rehber sayfaları (/evler/7-ev, /burclar/akrep) için içerik yapısı.
 * Metinler core/content/guides/ altındadır; sayfalar sadece bu yapıyı gösterir.
 */

/** Sayfadaki bir alt başlık ve altındaki paragraflar */
export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

/** Tek bir rehber sayfası (ör. "7. Ev Nedir?") */
export interface Guide {
  slug: string; // adresteki parça: "7-ev", "akrep"
  name: string; // kısa ad: "7. Ev", "Akrep"
  tagline: string; // liste kartındaki kısa açıklama: "İlişkiler · Ortaklıklar"
  title: string; // sayfa başlığı (h1 ve sekme): "7. Ev Nedir?"
  description: string; // Google arama sonucundaki açıklama (en fazla ~155 karakter)
  intro: string; // başlığın altındaki giriş paragrafı
  sections: GuideSection[];
}
/** Sayfanın üstündeki bilgi kutusunda bir satır (ör. "Element: Ateş") */
export interface GuideFact {
  label: string;
  value: string;
}
/** Bir rehber grubu (tüm evler / tüm burçlar) ve liste sayfasının metinleri */
export interface GuideCollection {
  path: string; // "evler", "burclar"
  eyebrow: string; // başlığın üstündeki küçük yazı: "Astroloji Rehberi"
  title: string; // liste sayfası başlığı: "12 Ev"
  description: string; // liste sayfasının Google açıklaması
  intro: string; // liste sayfasının giriş paragrafı
  ctaText: string; // detay sayfasının sonundaki "kendi haritanı hesapla" kutusunun metni
  items: Guide[];
}