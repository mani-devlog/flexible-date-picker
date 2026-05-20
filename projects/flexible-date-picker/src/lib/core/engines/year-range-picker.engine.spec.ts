import { createYearRangePickerEngine } from './year-range-picker.engine';

describe('year-range-picker engine', () => {
  it('selects a year range on apply', () => {
    const engine = createYearRangePickerEngine();
    engine.actions.open();
    engine.actions.selectYear(new Date(2020, 0, 1));
    engine.actions.selectYear(new Date(2023, 0, 1));
    engine.actions.apply();
    expect(engine.state.value.start?.getFullYear()).toBe(2020);
    expect(engine.state.value.end?.getFullYear()).toBe(2023);
    expect(engine.state.isOpen).toBeFalse();
  });
});
