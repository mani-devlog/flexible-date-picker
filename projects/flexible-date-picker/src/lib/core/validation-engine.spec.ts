import { createValidationEngine } from './validation-engine';

describe('validation-engine', () => {
  it('disables dates outside min/max', () => {
    const engine = createValidationEngine({
      min: new Date(2024, 0, 5),
      max: new Date(2024, 0, 15),
    });
    expect(engine.isDateDisabled(new Date(2024, 0, 1))).toBeTrue();
    expect(engine.isDateDisabled(new Date(2024, 0, 10))).toBeFalse();
    expect(engine.isDateDisabled(new Date(2024, 0, 20))).toBeTrue();
  });

  it('uses custom isDisabled callback', () => {
    const engine = createValidationEngine({
      isDisabled: (date) => date.getDay() === 0,
    });
    expect(engine.isDateDisabled(new Date(2024, 0, 7))).toBeTrue();
    expect(engine.isDateDisabled(new Date(2024, 0, 8))).toBeFalse();
  });

  it('clears isDisabled when updated with undefined', () => {
    const engine = createValidationEngine({
      isDisabled: (date) => date.getDay() === 0 || date.getDay() === 6,
    });
    expect(engine.isDateDisabled(new Date(2024, 0, 6))).toBeTrue();
    engine.updateOptions({ isDisabled: undefined });
    expect(engine.isDateDisabled(new Date(2024, 0, 6))).toBeFalse();
  });
});
