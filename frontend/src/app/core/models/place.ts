/**
 * Yer arama sonucu.
 * Backend: app/schemas/place.py -> PlaceOut (alan adları birebir aynı)
 */
export interface Place {
  name: string; // "Antalya"
  display_name: string; // "Antalya, Akdeniz Bölgesi, Türkiye"
  latitude: number;
  longitude: number;
  country: string | null;
} 