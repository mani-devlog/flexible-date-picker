import { createDatePickerEngine } from './date-picker.engine';

describe('date-picker engine', () => {
  it('selects a date and closes', () => {
    const engine = createDatePickerEngine();
    engine.actions.open();
    engine.actions.selectDate(new Date(2024, 2, 10));
    expect(engine.state.value?.getDate()).toBe(10);
    expect(engine.state.isOpen).toBeFalse();
  });

  it('keeps popover open and preserves time when time is enabled', () => {
    const engine = createDatePickerEngine({
      time: { enabled: true, defaultTime: { hours: 9, minutes: 30, seconds: 0 } },
    });
    engine.actions.open();
    engine.actions.selectDate(new Date(2024, 2, 10));
    expect(engine.state.isOpen).toBeTrue();
    expect(engine.state.value?.getHours()).toBe(9);
    expect(engine.state.value?.getMinutes()).toBe(30);
    engine.actions.setTime(18, 15);
    expect(engine.state.isOpen).toBeTrue();
    expect(engine.state.value?.getHours()).toBe(18);
  });
});
