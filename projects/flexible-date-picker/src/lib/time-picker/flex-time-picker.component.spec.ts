import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexTimePickerComponent } from './flex-time-picker.component';

describe('FlexTimePickerComponent', () => {
  let fixture: ComponentFixture<FlexTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexTimePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexTimePickerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
