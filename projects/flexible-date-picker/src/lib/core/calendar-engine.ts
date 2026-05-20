import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type {
  CalendarDay,
  CalendarMonth,
  CalendarMonthCell,
  CalendarMonthGrid,
  CalendarWeek,
  CalendarYearCell,
  CalendarYearGrid,
  DateRange,
} from '../models';
import type { WeekStart } from '../types';
import { isSameDay } from '../utils/compare-dates';
import {
  getHoverPreview,
  getOrderedRange,
  isInRange,
  isRangeEnd,
  isRangeStart,
  type RangePreview,
} from '../utils/range-utils';
import { normalizeDate } from '../utils/normalize-date';
import { getMonthLabels } from '../utils/locale-utils';
import type { ValidationEngine } from './validation-engine';

export interface CalendarEngineOptions {
  weekStartsOn?: WeekStart;
  localeCode?: string;
  validation?: ValidationEngine;
}

export interface CalendarContext {
  selectedDate?: Date | null;
  range?: DateRange;
  hoverDate?: Date | null;
  focusedDate?: Date | null;
}

function buildDay(
  date: Date,
  visibleMonth: Date,
  context: CalendarContext,
  validation?: ValidationEngine,
  hoverPreview?: RangePreview | null,
): CalendarDay {
  const range = context.range ?? { start: null, end: null };
  const isSelected = context.selectedDate ? isSameDay(date, context.selectedDate) : false;
  const inRange =
    isInRange(date, range, 'day', hoverPreview) ||
    (context.selectedDate ? isSameDay(date, context.selectedDate) : false);

  return {
    date,
    isCurrentMonth: isSameMonth(date, visibleMonth),
    isToday: isToday(date),
    isDisabled: validation?.isDateDisabled(date) ?? false,
    isSelected,
    isInRange: inRange && !isSelected,
    isRangeStart: isRangeStart(date, range, 'day', hoverPreview),
    isRangeEnd: isRangeEnd(date, range, 'day', hoverPreview),
    isFocused: context.focusedDate ? isSameDay(date, context.focusedDate) : false,
    isHovered: context.hoverDate ? isSameDay(date, context.hoverDate) : false,
  };
}

export function generateCalendarMonth(
  visibleDate: Date,
  context: CalendarContext = {},
  options: CalendarEngineOptions = {},
): CalendarMonth {
  const weekStartsOn = options.weekStartsOn ?? 0;
  const monthStart = startOfMonth(visibleDate);
  const monthEnd = endOfMonth(visibleDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const hoverPreview = context.hoverDate
    ? getHoverPreview(context.range ?? { start: null, end: null }, context.hoverDate, 'day')
    : getOrderedRange(context.range ?? { start: null, end: null }, 'day');

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: CalendarWeek[] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push({
      days: days.slice(i, i + 7).map((date) =>
        buildDay(date, visibleDate, context, options.validation, hoverPreview),
      ),
    });
  }

  return {
    weeks,
    month: visibleDate.getMonth(),
    year: visibleDate.getFullYear(),
  };
}

export function generateMonthGrid(
  year: number,
  context: CalendarContext = {},
  options: CalendarEngineOptions = {},
): CalendarMonthGrid {
  const labels = getMonthLabels(options.localeCode);
  const range = context.range ?? { start: null, end: null };
  const hoverPreview = context.hoverDate
    ? getHoverPreview(range, context.hoverDate, 'month')
    : getOrderedRange(range, 'month');

  const months: CalendarMonthCell[] = labels.map((label, index) => {
    const date = normalizeDate(new Date(year, index, 1), 'month');
    const isSelected =
      (context.selectedDate && normalizeDate(context.selectedDate, 'month').getTime() === date.getTime()) ||
      (range.start && normalizeDate(range.start, 'month').getTime() === date.getTime() && !range.end) ||
      (range.end && normalizeDate(range.end, 'month').getTime() === date.getTime() && !range.start);

    return {
      date,
      month: index,
      year,
      label,
      isDisabled: options.validation?.isDateDisabled(date) ?? false,
      isSelected: !!isSelected,
      isInRange: isInRange(date, range, 'month', hoverPreview) && !isSelected,
      isRangeStart: isRangeStart(date, range, 'month', hoverPreview),
      isRangeEnd: isRangeEnd(date, range, 'month', hoverPreview),
      isFocused:
        context.focusedDate !== undefined &&
        context.focusedDate !== null &&
        normalizeDate(context.focusedDate, 'month').getTime() === date.getTime(),
      isHovered:
        context.hoverDate !== undefined &&
        context.hoverDate !== null &&
        normalizeDate(context.hoverDate, 'month').getTime() === date.getTime(),
    };
  });

  return { year, months };
}

const YEARS_PER_PAGE = 12;

export function getYearPageStart(year: number): number {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export function generateYearGrid(
  pageStartYear: number,
  context: CalendarContext = {},
  options: CalendarEngineOptions = {},
): CalendarYearGrid {
  const range = context.range ?? { start: null, end: null };
  const hoverPreview = context.hoverDate
    ? getHoverPreview(range, context.hoverDate, 'year')
    : getOrderedRange(range, 'year');
  const currentYear = new Date().getFullYear();

  const years: CalendarYearCell[] = Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
    const year = pageStartYear + index;
    const date = normalizeDate(new Date(year, 0, 1), 'year');
    const isSelected =
      (context.selectedDate &&
        normalizeDate(context.selectedDate, 'year').getFullYear() === year) ||
      (range.start &&
        normalizeDate(range.start, 'year').getFullYear() === year &&
        !range.end) ||
      (range.end &&
        normalizeDate(range.end, 'year').getFullYear() === year &&
        !range.start);

    return {
      date,
      year,
      label: String(year),
      isDisabled: options.validation?.isDateDisabled(date) ?? false,
      isSelected: !!isSelected,
      isInRange: isInRange(date, range, 'year', hoverPreview) && !isSelected,
      isRangeStart: isRangeStart(date, range, 'year', hoverPreview),
      isRangeEnd: isRangeEnd(date, range, 'year', hoverPreview),
      isFocused:
        context.focusedDate !== undefined &&
        context.focusedDate !== null &&
        normalizeDate(context.focusedDate, 'year').getFullYear() === year,
      isHovered:
        context.hoverDate !== undefined &&
        context.hoverDate !== null &&
        normalizeDate(context.hoverDate, 'year').getFullYear() === year,
      isToday: year === currentYear,
    };
  });

  return {
    startYear: pageStartYear,
    endYear: pageStartYear + YEARS_PER_PAGE - 1,
    years,
  };
}

export function navigateYearPage(pageStartYear: number, direction: 'prev' | 'next'): number {
  return pageStartYear + (direction === 'next' ? YEARS_PER_PAGE : -YEARS_PER_PAGE);
}

export function navigateVisibleDate(
  visibleDate: Date,
  direction: 'prev' | 'next',
  granularity: 'day' | 'month' | 'year' = 'month',
): Date {
  const date = new Date(visibleDate);
  switch (granularity) {
    case 'day':
      return addDays(date, direction === 'next' ? 1 : -1);
    case 'month':
      date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
      return date;
    case 'year':
      date.setFullYear(date.getFullYear() + (direction === 'next' ? 1 : -1));
      return date;
  }
}

export function navigateFocusedDate(
  focusedDate: Date,
  key: string,
  weekStartsOn: WeekStart = 0,
): Date {
  switch (key) {
    case 'ArrowLeft':
      return addDays(focusedDate, -1);
    case 'ArrowRight':
      return addDays(focusedDate, 1);
    case 'ArrowUp':
      return addDays(focusedDate, -7);
    case 'ArrowDown':
      return addDays(focusedDate, 7);
    case 'Home':
      return startOfWeek(focusedDate, { weekStartsOn });
    case 'End':
      return endOfWeek(focusedDate, { weekStartsOn });
    case 'PageUp':
      return addDays(focusedDate, -28);
    case 'PageDown':
      return addDays(focusedDate, 28);
    default:
      return focusedDate;
  }
}
