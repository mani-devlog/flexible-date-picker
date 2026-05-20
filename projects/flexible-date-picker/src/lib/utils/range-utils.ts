import type { DateRange } from '../models';
import type { Granularity } from '../types';
import {
  isAfterGranularity,
  isBeforeGranularity,
  isEqualGranularity,
  isSameGranularity,
} from './compare-dates';
import { normalizeDate } from './normalize-date';

export interface RangePreview {
  start: Date;
  end: Date;
}

export function normalizeRange(range: DateRange, granularity: Granularity): DateRange {
  return {
    start: range.start ? normalizeDate(range.start, granularity) : null,
    end: range.end ? normalizeDate(range.end, granularity) : null,
  };
}

export function isCompleteRange(range: DateRange): boolean {
  return range.start !== null && range.end !== null;
}

export function getOrderedRange(range: DateRange, granularity: Granularity): RangePreview | null {
  if (!range.start || !range.end) {
    return null;
  }
  const start = normalizeDate(range.start, granularity);
  const end = normalizeDate(range.end, granularity);
  if (isBeforeGranularity(end, start, granularity)) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function isInRange(
  date: Date,
  range: DateRange,
  granularity: Granularity,
  hoverPreview?: RangePreview | null,
): boolean {
  const activeRange = hoverPreview ?? getOrderedRange(range, granularity);
  if (!activeRange) {
    return false;
  }
  const normalized = normalizeDate(date, granularity);
  const afterStart =
    isEqualGranularity(normalized, activeRange.start, granularity) ||
    isAfterGranularity(normalized, activeRange.start, granularity);
  const beforeEnd =
    isEqualGranularity(normalized, activeRange.end, granularity) ||
    isBeforeGranularity(normalized, activeRange.end, granularity);
  return afterStart && beforeEnd;
}

export function isRangeStart(
  date: Date,
  range: DateRange,
  granularity: Granularity,
  hoverPreview?: RangePreview | null,
): boolean {
  const activeRange = hoverPreview ?? getOrderedRange(range, granularity);
  if (!activeRange) {
    return false;
  }
  return isSameGranularity(date, activeRange.start, granularity);
}

export function isRangeEnd(
  date: Date,
  range: DateRange,
  granularity: Granularity,
  hoverPreview?: RangePreview | null,
): boolean {
  const activeRange = hoverPreview ?? getOrderedRange(range, granularity);
  if (!activeRange) {
    return false;
  }
  return isSameGranularity(date, activeRange.end, granularity);
}

export function getHoverPreview(
  range: DateRange,
  hoverDate: Date | null,
  granularity: Granularity,
): RangePreview | null {
  if (!hoverDate) {
    return null;
  }
  const normalizedHover = normalizeDate(hoverDate, granularity);
  if (range.start && !range.end) {
    const start = normalizeDate(range.start, granularity);
    if (isBeforeGranularity(normalizedHover, start, granularity)) {
      return { start: normalizedHover, end: start };
    }
    return { start, end: normalizedHover };
  }
  if (!range.start && range.end) {
    const end = normalizeDate(range.end, granularity);
    if (isBeforeGranularity(normalizedHover, end, granularity)) {
      return { start: normalizedHover, end };
    }
    return { start: end, end: normalizedHover };
  }
  return null;
}

export function selectRangeDate(
  current: DateRange,
  date: Date,
  granularity: Granularity,
): DateRange {
  const normalized = normalizeDate(date, granularity);
  if (!current.start || (current.start && current.end)) {
    return { start: normalized, end: null };
  }
  const start = normalizeDate(current.start, granularity);
  if (isSameGranularity(normalized, start, granularity)) {
    return { start: normalized, end: normalized };
  }
  if (isBeforeGranularity(normalized, start, granularity)) {
    return { start: normalized, end: start };
  }
  return { start, end: normalized };
}
