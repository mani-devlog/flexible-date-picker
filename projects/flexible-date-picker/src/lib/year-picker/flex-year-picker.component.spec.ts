import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexYearPickerComponent } from './flex-year-picker.component';

describe('FlexYearPickerComponent', () => {
  let component: FlexYearPickerComponent;
  let fixture: ComponentFixture<FlexYearPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexYearPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexYearPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update display after selecting a year', () => {
    component.toggle();
    component.selectYear(new Date(2024, 0, 1));
    fixture.detectChanges();
    expect(component.displayValue).toBe('2024');
  });
});
