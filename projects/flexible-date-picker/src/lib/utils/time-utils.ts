import { setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export const TIME_REFERENCE_DATE = new Date(2000, 0, 1);

export function getTimeParts(date: Date): TimeParts {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

export function mergeDateAndTime(
  date: Date,
  hours: number,
  minutes: number,
  seconds = 0,
): Date {
  return setSeconds(setMinutes(setHours(startOfDay(date), hours), minutes), seconds);
}

export function createTimeValue(hours: number, minutes: number, seconds = 0): Date {
  return mergeDateAndTime(TIME_REFERENCE_DATE, hours, minutes, seconds);
}

export function mergeDayPreservingTime(
  day: Date,
  existing: Date | null,
  defaultTime: Partial<TimeParts>,
): Date {
  const hours = existing?.getHours() ?? defaultTime.hours ?? 0;
  const minutes = existing?.getMinutes() ?? defaultTime.minutes ?? 0;
  const seconds = existing?.getSeconds() ?? defaultTime.seconds ?? 0;
  return mergeDateAndTime(day, hours, minutes, seconds);
}

export function mergeRangeDayPreservingTime(
  day: Date,
  existing: Date | null,
  defaultTime: Partial<TimeParts>,
): Date {
  return mergeDayPreservingTime(day, existing, defaultTime);
}

export function generateHourOptions(step = 1, use24Hour = true): number[] {
  if (!use24Hour) {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  }
  const safeStep = Math.max(1, step);
  const options: number[] = [];
  for (let hour = 0; hour < 24; hour += safeStep) {
    options.push(hour);
  }
  return options;
}

export function generateMinuteOptions(step = 1): number[] {
  const safeStep = Math.max(1, step);
  const options: number[] = [];
  for (let minute = 0; minute < 60; minute += safeStep) {
    options.push(minute);
  }
  return options;
}

export function generateSecondOptions(step = 1): number[] {
  return generateMinuteOptions(step);
}

export function padTimeUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function to12HourParts(hours24: number): { hour12: number; period: 'AM' | 'PM' } {
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = hours24 % 12 || 12;
  return { hour12, period };
}

export function to24HourParts(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function isTimeRangeValid(
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) {
    return false;
  }
  return start.getTime() <= end.getTime();
}

export function compareTimeOnly(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export const TIME_DRUM_LOOP_COPIES = 3;

export function buildLoopedOptions<T>(options: readonly T[]): T[] {
  if (options.length <= 1) {
    return [...options];
  }
  return [
    ...options,
    ...options,
    ...options,
  ];
}

export function getLoopedOptionIndex(rawIndex: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return ((rawIndex % length) + length) % length;
}

export function getLoopedScrollIndex(selectedIndex: number, length: number): number {
  if (length <= 1) {
    return Math.max(selectedIndex, 0);
  }
  return length + selectedIndex;
}

export function normalizeLoopedScrollIndex(rawIndex: number, length: number): number {
  return getLoopedScrollIndex(getLoopedOptionIndex(rawIndex, length), length);
}

export function shouldNormalizeLoopedScroll(rawIndex: number, length: number): boolean {
  return length > 1 && (rawIndex < length || rawIndex >= length * 2);
}
