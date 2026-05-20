import {
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isEqual,
  compareAsc,
} from 'date-fns';
import type { Granularity } from '../types';

export function isSameGranularity(a: Date, b: Date, granularity: Granularity): boolean {
  switch (granularity) {
    case 'day':
      return isSameDay(a, b);
    case 'month':
      return isSameMonth(a, b);
    case 'year':
      return isSameYear(a, b);
  }
}

export function isBeforeGranularity(a: Date, b: Date, granularity: Granularity): boolean {
  switch (granularity) {
    case 'day':
      return isBefore(a, b) && !isSameDay(a, b);
    case 'month':
      return isBefore(a, b) && !isSameMonth(a, b);
    case 'year':
      return isBefore(a, b) && !isSameYear(a, b);
  }
}

export function isAfterGranularity(a: Date, b: Date, granularity: Granularity): boolean {
  switch (granularity) {
    case 'day':
      return isAfter(a, b) && !isSameDay(a, b);
    case 'month':
      return isAfter(a, b) && !isSameMonth(a, b);
    case 'year':
      return isAfter(a, b) && !isSameYear(a, b);
  }
}

export function isEqualGranularity(a: Date, b: Date, granularity: Granularity): boolean {
  return isSameGranularity(a, b, granularity);
}

export function compareDates(a: Date, b: Date): number {
  return compareAsc(a, b);
}

export { isSameDay, isSameMonth, isSameYear, isBefore, isAfter, isEqual };
