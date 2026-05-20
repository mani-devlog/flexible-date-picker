import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import type { DateRange, PresetRange } from '../models';
import { normalizeDate } from './normalize-date';

function dayRange(start: Date, end: Date): DateRange {
  return { start: normalizeDate(start, 'day'), end: normalizeDate(end, 'day') };
}

function monthRange(start: Date, end: Date): DateRange {
  return { start: normalizeDate(start, 'month'), end: normalizeDate(end, 'month') };
}

function yearRange(start: Date, end: Date): DateRange {
  return { start: normalizeDate(start, 'year'), end: normalizeDate(end, 'year') };
}

export const DEFAULT_PRESET_RANGES: PresetRange[] = [
  {
    id: 'today',
    label: 'Today',
    getRange: (ref = new Date()) => dayRange(ref, ref),
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getRange: (ref = new Date()) => {
      const yesterday = subDays(ref, 1);
      return dayRange(yesterday, yesterday);
    },
  },
  {
    id: 'last7',
    label: 'Last 7 Days',
    getRange: (ref = new Date()) => dayRange(subDays(ref, 6), ref),
  },
  {
    id: 'last30',
    label: 'Last 30 Days',
    getRange: (ref = new Date()) => dayRange(subDays(ref, 29), ref),
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    getRange: (ref = new Date()) => dayRange(startOfMonth(ref), endOfMonth(ref)),
  },
  {
    id: 'previousMonth',
    label: 'Previous Month',
    getRange: (ref = new Date()) => {
      const prev = subMonths(ref, 1);
      return dayRange(startOfMonth(prev), endOfMonth(prev));
    },
  },
  {
    id: 'thisYear',
    label: 'This Year',
    getRange: (ref = new Date()) => dayRange(startOfYear(ref), endOfYear(ref)),
  },
];

export const DEFAULT_MONTH_PRESET_RANGES: PresetRange[] = [
  {
    id: 'thisMonth',
    label: 'This Month',
    getRange: (ref = new Date()) => monthRange(startOfMonth(ref), endOfMonth(ref)),
  },
  {
    id: 'previousMonth',
    label: 'Previous Month',
    getRange: (ref = new Date()) => {
      const prev = subMonths(ref, 1);
      return monthRange(startOfMonth(prev), endOfMonth(prev));
    },
  },
  {
    id: 'last3Months',
    label: 'Last 3 Months',
    getRange: (ref = new Date()) => monthRange(subMonths(ref, 2), ref),
  },
  {
    id: 'last6Months',
    label: 'Last 6 Months',
    getRange: (ref = new Date()) => monthRange(subMonths(ref, 5), ref),
  },
  {
    id: 'thisYear',
    label: 'This Year',
    getRange: (ref = new Date()) => monthRange(startOfYear(ref), endOfYear(ref)),
  },
];

export const DEFAULT_YEAR_PRESET_RANGES: PresetRange[] = [
  {
    id: 'thisYear',
    label: 'This Year',
    getRange: (ref = new Date()) => yearRange(startOfYear(ref), endOfYear(ref)),
  },
  {
    id: 'previousYear',
    label: 'Previous Year',
    getRange: (ref = new Date()) => {
      const prev = subYears(ref, 1);
      return yearRange(startOfYear(prev), endOfYear(prev));
    },
  },
  {
    id: 'last5Years',
    label: 'Last 5 Years',
    getRange: (ref = new Date()) => yearRange(subYears(ref, 4), ref),
  },
  {
    id: 'last10Years',
    label: 'Last 10 Years',
    getRange: (ref = new Date()) => yearRange(subYears(ref, 9), ref),
  },
];
