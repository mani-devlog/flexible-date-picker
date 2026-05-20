import { createYearPickerEngine } from './year-picker.engine';

describe('year-picker engine', () => {
  it('selects a year and closes', () => {
    const engine = createYearPickerEngine();
    engine.actions.open();
    engine.actions.selectYear(new Date(2024, 0, 1));
    expect(engine.state.value?.getFullYear()).toBe(2024);
    expect(engine.state.isOpen).toBeFalse();
  });
});
