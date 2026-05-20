import { DEFAULT_PRESET_RANGES } from './preset-ranges';
import type { PresetRange } from '../models';

describe('preset-ranges', () => {
  const ref = new Date(2024, 5, 15);

  it('provides today preset', () => {
    const preset = DEFAULT_PRESET_RANGES.find((p: PresetRange) => p.id === 'today')!;
    const range = preset.getRange(ref);
    expect(range.start?.getDate()).toBe(15);
    expect(range.end?.getDate()).toBe(15);
  });

  it('provides last 7 days preset', () => {
    const preset = DEFAULT_PRESET_RANGES.find((p: PresetRange) => p.id === 'last7')!;
    const range = preset.getRange(ref);
    expect(range.start?.getDate()).toBe(9);
    expect(range.end?.getDate()).toBe(15);
  });
});
