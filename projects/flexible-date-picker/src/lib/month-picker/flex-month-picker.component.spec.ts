import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexMonthPickerComponent } from './flex-month-picker.component';

describe('FlexMonthPickerComponent', () => {
  let component: FlexMonthPickerComponent;
  let fixture: ComponentFixture<FlexMonthPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexMonthPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexMonthPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update display after selecting a month', () => {
    component.toggle();
    component.selectMonth(new Date(2024, 5, 1));
    fixture.detectChanges();
    expect(component.displayValue).toBe('Jun 2024');
  });
});
