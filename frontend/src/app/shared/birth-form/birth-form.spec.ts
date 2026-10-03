import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BirthForm } from './birth-form';

describe('BirthForm', () => {
  let component: BirthForm;
  let fixture: ComponentFixture<BirthForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthForm],
    }).compileComponents();

    fixture = TestBed.createComponent(BirthForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
