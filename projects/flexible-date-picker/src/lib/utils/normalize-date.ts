import { startOfDay, startOfMonth, startOfYear } from 'date-fns';
import type { Granularity } from '../types';

export function normalizeDate(date: Date, granularity: Granularity = 'day'): Date {
  switch (granularity) {
    case 'day':
      return startOfDay(date);
    case 'month':
      return startOfMonth(date);
    case 'year':
      return startOfYear(date);
  }
}

export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  let result = date;
  if (min && date < min) {
    result = min;
  }
  if (max && result > max) {
    result = max;
  }
  return result;
}
