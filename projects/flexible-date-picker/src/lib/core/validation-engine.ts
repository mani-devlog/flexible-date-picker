import type { DateRange } from '../models';
import { isAfterGranularity, isBeforeGranularity } from '../utils/compare-dates';
import { normalizeDate } from '../utils/normalize-date';
import type { Granularity } from '../types';

export interface ValidationOptions {
  min?: Date | null;
  max?: Date | null;
  isDisabled?: (date: Date) => boolean;
  minRangeSpan?: number;
  maxRangeSpan?: number;
  granularity?: Granularity;
}

export class ValidationEngine {
  constructor(private readonly options: ValidationOptions = {}) {}

  isDateDisabled(date: Date): boolean {
    const granularity = this.options.granularity ?? 'day';
    const normalized = normalizeDate(date, granularity);
    if (this.options.min && isBeforeGranularity(normalized, this.options.min, granularity)) {
      return true;
    }
    if (this.options.max && isAfterGranularity(normalized, this.options.max, granularity)) {
      return true;
    }
    return this.options.isDisabled?.(normalized) ?? false;
  }

  isRangeValid(range: DateRange): boolean {
    if (!range.start || !range.end) {
      return true;
    }
    const granularity = this.options.granularity ?? 'day';
    const start = normalizeDate(range.start, granularity);
    const end = normalizeDate(range.end, granularity);
    if (this.isDateDisabled(start) || this.isDateDisabled(end)) {
      return false;
    }
    if (start.getTime() > end.getTime()) {
      return false;
    }
    const span = Math.abs(end.getTime() - start.getTime());
    if (this.options.minRangeSpan !== undefined && span < this.options.minRangeSpan) {
      return false;
    }
    if (this.options.maxRangeSpan !== undefined && span > this.options.maxRangeSpan) {
      return false;
    }
    return true;
  }

  updateOptions(options: Partial<ValidationOptions>): void {
    (Object.keys(options) as (keyof ValidationOptions)[]).forEach((key) => {
      const value = options[key];
      if (value === undefined) {
        delete this.options[key];
      } else {
        this.options[key] = value as never;
      }
    });
  }
}

export function createValidationEngine(options?: ValidationOptions): ValidationEngine {
  return new ValidationEngine(options);
}
