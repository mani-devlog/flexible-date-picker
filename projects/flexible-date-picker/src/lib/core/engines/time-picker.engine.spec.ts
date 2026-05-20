import { createTimePickerEngine, createTimeRangePickerEngine } from './time-picker.engine';

describe('time-picker engine', () => {
  it('applies a time value', () => {
    const engine = createTimePickerEngine();
    engine.actions.open();
    engine.actions.setDraftTime(14, 30);
    engine.actions.apply();
    expect(engine.state.value?.getHours()).toBe(14);
    expect(engine.state.value?.getMinutes()).toBe(30);
    expect(engine.state.isOpen).toBeFalse();
  });
});

describe('time-range-picker engine', () => {
  it('applies a valid time range', () => {
    const engine = createTimeRangePickerEngine();
    engine.actions.open();
    engine.actions.setDraftStart(9, 0);
    engine.actions.setDraftEnd(17, 0);
    engine.actions.apply();
    expect(engine.selectors.isRangeValid()).toBeTrue();
    expect(engine.state.value.start?.getHours()).toBe(9);
    expect(engine.state.value.end?.getHours()).toBe(17);
  });
});
