import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexTimeRangePickerComponent } from './flex-time-range-picker.component';

describe('FlexTimeRangePickerComponent', () => {
  let fixture: ComponentFixture<FlexTimeRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexTimeRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexTimeRangePickerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
