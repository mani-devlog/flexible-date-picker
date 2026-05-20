import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexYearRangePickerComponent } from './flex-year-range-picker.component';

describe('FlexYearRangePickerComponent', () => {
  let component: FlexYearRangePickerComponent;
  let fixture: ComponentFixture<FlexYearRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexYearRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexYearRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
