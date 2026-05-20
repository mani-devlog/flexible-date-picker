import { createMonthPickerEngine } from './month-picker.engine';

describe('month-picker engine', () => {
  it('selects a month and closes', () => {
    const engine = createMonthPickerEngine();
    engine.actions.open();
    engine.actions.selectMonth(new Date(2024, 5, 1));
    expect(engine.state.value?.getMonth()).toBe(5);
    expect(engine.state.value?.getFullYear()).toBe(2024);
    expect(engine.state.isOpen).toBeFalse();
  });
});
