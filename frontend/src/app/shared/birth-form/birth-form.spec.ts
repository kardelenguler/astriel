import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Place } from '../../core/models/place';
import { BirthForm } from './birth-form';

const PLACE = {
  name: 'Antalya',
  display_name: 'Antalya',
  latitude: 36.9,
  longitude: 30.7,
  country: '',
} as Place;

describe('BirthForm', () => {
  let fixture: ComponentFixture<BirthForm>;
  let component: BirthForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BirthForm);
    component = fixture.componentInstance;
  });

  it('oluşturulabilmeli ve boş açılmalı', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.form.controls.birthDate.value).toBe('');
    expect(component.selectedPlace()).toBeNull();
  });

  it('başlangıç değeri verilirse formu doldurmalı ve yeri seçili getirmeli', async () => {
    fixture.componentRef.setInput('initialValue', {
      birthDate: '2005-01-26',
      birthTime: '14:15',
      place: PLACE,
    });
    await fixture.whenStable();

    expect(component.form.controls.birthDate.value).toBe('2005-01-26');
    expect(component.form.controls.birthTime.value).toBe('14:15');
    expect(component.selectedPlace()).toEqual(PLACE);
    expect(component.form.valid).toBe(true);
  });

  it('saat bilinmiyorsa "Saatimi bilmiyorum" işaretli gelmeli', async () => {
    fixture.componentRef.setInput('initialValue', {
      birthDate: '2005-01-26',
      birthTime: null,
      place: PLACE,
    });
    await fixture.whenStable();

    expect(component.form.controls.unknownTime.value).toBe(true);
    expect(component.form.controls.birthTime.disabled).toBe(true);
  });
}); 