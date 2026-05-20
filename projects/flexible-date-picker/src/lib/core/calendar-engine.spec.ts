import { generateCalendarMonth } from './calendar-engine';
import type { CalendarWeek, CalendarDay } from '../models';

describe('calendar-engine', () => {
  it('generates a calendar month with 6 weeks by default', () => {
    const month = generateCalendarMonth(new Date(2024, 1, 1));
    expect(month.weeks.length).toBeGreaterThanOrEqual(4);
    expect(month.weeks.every((week: CalendarWeek) => week.days.length === 7)).toBeTrue();
    expect(month.month).toBe(1);
    expect(month.year).toBe(2024);
  });

  it('respects weekStartsOn', () => {
    const sundayStart = generateCalendarMonth(new Date(2024, 1, 1), {}, { weekStartsOn: 0 });
    const mondayStart = generateCalendarMonth(new Date(2024, 1, 1), {}, { weekStartsOn: 1 });
    expect(sundayStart.weeks[0].days[0].date.getDay()).toBe(0);
    expect(mondayStart.weeks[0].days[0].date.getDay()).toBe(1);
  });

  it('marks selected and in-range days', () => {
    const month = generateCalendarMonth(new Date(2024, 1, 1), {
      range: { start: new Date(2024, 1, 5), end: new Date(2024, 1, 10) },
    });
    const flat = month.weeks.flatMap((w: CalendarWeek) => w.days);
    const inRange = flat.filter((d: CalendarDay) => d.isInRange || d.isRangeStart || d.isRangeEnd);
    expect(inRange.length).toBeGreaterThan(0);
  });
});
