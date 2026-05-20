import { format, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { WeekStart } from '../types';

const localeMap: Record<string, Locale> = {
  en: enUS,
};

export function getDateFnsLocale(code: string): Locale {
  return localeMap[code] ?? enUS;
}

export function registerLocale(code: string, locale: Locale): void {
  localeMap[code] = locale;
}

export function formatDate(
  date: Date,
  pattern: string,
  localeCode = 'en',
): string {
  return format(date, pattern, { locale: getDateFnsLocale(localeCode) });
}

export function getWeekdayLabels(weekStartsOn: WeekStart, localeCode = 'en'): string[] {
  const locale = getDateFnsLocale(localeCode);
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = ((weekStartsOn + i) % 7) as WeekStart;
    const refDate = new Date(2024, 0, dayIndex === 0 ? 7 : dayIndex);
    labels.push(format(refDate, 'EEEEE', { locale }));
  }
  return labels;
}

export function getMonthLabels(localeCode = 'en'): string[] {
  const locale = getDateFnsLocale(localeCode);
  return Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), 'MMM', { locale }),
  );
}
