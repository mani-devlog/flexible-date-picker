import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexDatePickerComponent } from './flex-date-picker.component';

describe('FlexDatePickerComponent', () => {
  let component: FlexDatePickerComponent;
  let fixture: ComponentFixture<FlexDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexDatePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlexDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open on toggle', () => {
    component.toggle();
    expect(component.engine.state.isOpen).toBeTrue();
  });

  it('should update display after selecting a date', () => {
    component.toggle();
    component.selectDate(new Date(2024, 3, 15));
    fixture.detectChanges();
    expect(component.displayValue).toContain('15');
    expect(component.displayValue).not.toBe('Select date');
  });

  it('should have accessible trigger', () => {
    const trigger = fixture.nativeElement.querySelector('.flex-picker-trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('should show calendar icon by default', () => {
    expect(fixture.nativeElement.querySelector('flex-calendar-icon')).toBeTruthy();
  });

  it('should hide calendar icon when showIcon is false', () => {
    fixture.componentRef.setInput('showIcon', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('flex-calendar-icon')).toBeFalsy();
  });

  it('should apply colorScheme on the picker wrapper', () => {
    fixture.componentRef.setInput('colorScheme', 'dark');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.flex-picker-wrapper');
    expect(wrapper.getAttribute('data-flex-theme')).toBe('dark');
  });

  it('should not set data-flex-theme when colorScheme is unset', () => {
    const wrapper = fixture.nativeElement.querySelector('.flex-picker-wrapper');
    expect(wrapper.hasAttribute('data-flex-theme')).toBeFalse();
  });

  it('should apply customColors as CSS variables on the picker wrapper', () => {
    fixture.componentRef.setInput('customColors', {
      primary: '#9333ea',
      range: '#ede9fe',
    });
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.flex-picker-wrapper') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--flex-primary')).toBe('#9333ea');
    expect(wrapper.style.getPropertyValue('--flex-range')).toBe('#ede9fe');
  });
});
