import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartWheel } from './chart-wheel';

describe('ChartWheel', () => {
  let component: ChartWheel;
  let fixture: ComponentFixture<ChartWheel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartWheel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartWheel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
