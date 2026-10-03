import { TestBed } from '@angular/core/testing';

import { HOUSE_MEANINGS } from '../content/houses';
import { SIGN_MEANINGS } from '../content/signs';
import { InterpretationService } from './interpretation.service';

describe('InterpretationService', () => {
  let service: InterpretationService;

  beforeEach(() => {
    service = TestBed.inject(InterpretationService);
  });

  it("İkizler'deki 1. ev için doğru başlık ve cümleyi kurmalı", () => {
    const result = service.forHouse(1, { sign: { key: 'gemini' }, formatted: "29°39' İkizler" });

    expect(result?.title).toBe('1. Ev · Benlik');
    expect(result?.heading).toBe("İkizler'de 1. Ev");
    expect(result?.text).toContain('Kişi kendini ifade ederken meraklı olma');
    expect(result?.source).toBe('static');
  });

  it('burç eklerini ünlü uyumuna göre doğru yazmalı', () => {
    const heading = (key: string) =>
      service.forHouse(2, { sign: { key }, formatted: '' })?.heading;

    expect(heading('cancer')).toBe("Yengeç'te 2. Ev");
    expect(heading('aries')).toBe("Koç'ta 2. Ev");
    expect(heading('taurus')).toBe("Boğa'da 2. Ev");
    expect(heading('libra')).toBe("Terazi'de 2. Ev");
  });

  it('Güneş, Ay ve Yükselen başlıklarını doğru kurmalı', () => {
    const sun = service.forPoint('sun', { sign: { key: 'aquarius' }, formatted: '' });
    const moon = service.forPoint('moon', { sign: { key: 'leo' }, formatted: '' });
    const asc = service.forPoint('ascendant', { sign: { key: 'gemini' }, formatted: '' });

    expect(sun?.heading).toBe("Kova'da Güneş");
    expect(moon?.heading).toBe("Aslan'da Ay");
    expect(asc?.heading).toBe('Yükselen İkizler');
  });

  it('144 ev-burç kombinasyonunun hepsi eksiksiz bir metin üretmeli', () => {
    for (const houseNo of Object.keys(HOUSE_MEANINGS).map(Number)) {
      for (const signKey of Object.keys(SIGN_MEANINGS)) {
        const result = service.forHouse(houseNo, { sign: { key: signKey }, formatted: '' });

        expect(result).not.toBeNull();
        expect(result!.text).not.toContain('undefined');
        expect(result!.text.endsWith('.')).toBe(true);
      }
    }
  });

  it('bilinmeyen bir burç ya da ev için null dönmeli (sayfa çökmemeli)', () => {
    expect(service.forHouse(1, { sign: { key: 'yok' }, formatted: '' })).toBeNull();
    expect(service.forHouse(13, { sign: { key: 'gemini' }, formatted: '' })).toBeNull();
  });
}); 