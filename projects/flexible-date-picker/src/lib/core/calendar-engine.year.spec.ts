import { generateYearGrid, getYearPageStart, navigateYearPage } from './calendar-engine';
import type { CalendarYearCell } from '../models';

describe('year grid', () => {
  it('generates 12 years per page', () => {
    const grid = generateYearGrid(2020);
    expect(grid.years.length).toBe(12);
    expect(grid.startYear).toBe(2020);
    expect(grid.endYear).toBe(2031);
    expect(grid.years[0].year).toBe(2020);
    expect(grid.years[11].year).toBe(2031);
  });

  it('marks selected year in range', () => {
    const grid = generateYearGrid(2020, {
      range: { start: new Date(2022, 0, 1), end: new Date(2025, 0, 1) },
    });
    const inRange = grid.years.filter((y: CalendarYearCell) => y.isInRange || y.isRangeStart || y.isRangeEnd);
    expect(inRange.length).toBeGreaterThan(0);
  });

  it('navigates year pages', () => {
    expect(getYearPageStart(2025)).toBe(2016);
    expect(navigateYearPage(2020, 'next')).toBe(2032);
    expect(navigateYearPage(2020, 'prev')).toBe(2008);
  });
});
