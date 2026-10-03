import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCharts } from './my-charts';

describe('MyCharts', () => {
  let component: MyCharts;
  let fixture: ComponentFixture<MyCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCharts],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
