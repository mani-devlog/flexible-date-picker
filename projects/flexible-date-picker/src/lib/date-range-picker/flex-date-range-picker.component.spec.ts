import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexDateRangePickerComponent } from './flex-date-range-picker.component';

describe('FlexDateRangePickerComponent', () => {
  let component: FlexDateRangePickerComponent;
  let fixture: ComponentFixture<FlexDateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexDateRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexDateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open picker', () => {
    component.toggle();
    expect(component.engine.state.isOpen).toBeTrue();
  });
});
