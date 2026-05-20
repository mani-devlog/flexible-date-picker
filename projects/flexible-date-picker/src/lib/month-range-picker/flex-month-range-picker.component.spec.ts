import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexMonthRangePickerComponent } from './flex-month-range-picker.component';

describe('FlexMonthRangePickerComponent', () => {
  let component: FlexMonthRangePickerComponent;
  let fixture: ComponentFixture<FlexMonthRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexMonthRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexMonthRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
