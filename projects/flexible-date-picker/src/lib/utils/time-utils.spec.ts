import {
  buildLoopedOptions,
  getLoopedOptionIndex,
  getLoopedScrollIndex,
  normalizeLoopedScrollIndex,
  shouldNormalizeLoopedScroll,
} from './time-utils';

describe('time drum loop helpers', () => {
  const hours = Array.from({ length: 24 }, (_, index) => index);

  it('builds three copies of options', () => {
    expect(buildLoopedOptions(hours)).toEqual([...hours, ...hours, ...hours]);
  });

  it('wraps option index for looped scroll positions', () => {
    expect(getLoopedOptionIndex(25, 24)).toBe(1);
    expect(getLoopedOptionIndex(-1, 24)).toBe(23);
  });

  it('centers scroll in the middle copy', () => {
    expect(getLoopedScrollIndex(1, 24)).toBe(25);
    expect(getLoopedScrollIndex(23, 24)).toBe(47);
  });

  it('normalizes scroll indices outside the middle copy', () => {
    expect(normalizeLoopedScrollIndex(1, 24)).toBe(25);
    expect(normalizeLoopedScrollIndex(47, 24)).toBe(47);
    expect(normalizeLoopedScrollIndex(70, 24)).toBe(46);
  });

  it('detects when loop scroll should be normalized', () => {
    expect(shouldNormalizeLoopedScroll(1, 24)).toBeTrue();
    expect(shouldNormalizeLoopedScroll(25, 24)).toBeFalse();
    expect(shouldNormalizeLoopedScroll(70, 24)).toBeTrue();
  });
});
