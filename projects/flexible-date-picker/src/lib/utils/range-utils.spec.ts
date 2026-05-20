import { getHoverPreview, selectRangeDate } from './range-utils';

describe('range-utils', () => {
  it('selects start then end', () => {
    const first = selectRangeDate({ start: null, end: null }, new Date(2024, 0, 10), 'day');
    expect(first.start?.getDate()).toBe(10);
    expect(first.end).toBeNull();

    const second = selectRangeDate(first, new Date(2024, 0, 20), 'day');
    expect(second.end?.getDate()).toBe(20);
  });

  it('supports reverse range selection', () => {
    const first = selectRangeDate({ start: null, end: null }, new Date(2024, 0, 20), 'day');
    const second = selectRangeDate(first, new Date(2024, 0, 5), 'day');
    expect(second.start?.getDate()).toBe(5);
    expect(second.end?.getDate()).toBe(20);
  });

  it('computes hover preview', () => {
    const preview = getHoverPreview(
      { start: new Date(2024, 0, 10), end: null },
      new Date(2024, 0, 5),
      'day',
    );
    expect(preview?.start.getDate()).toBe(5);
    expect(preview?.end.getDate()).toBe(10);
  });
});
