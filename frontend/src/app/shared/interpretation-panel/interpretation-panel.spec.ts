import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterpretationPanel } from './interpretation-panel';

describe('InterpretationPanel', () => {
  let component: InterpretationPanel;
  let fixture: ComponentFixture<InterpretationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterpretationPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(InterpretationPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
