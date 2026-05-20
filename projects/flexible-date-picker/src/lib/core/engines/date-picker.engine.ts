import { startOfMonth } from 'date-fns';
import type { CalendarMonth } from '../../models';
import type { WeekStart } from '../../types';
import {
  mergeDateAndTime,
  mergeDayPreservingTime,
  type TimeParts,
} from '../../utils/time-utils';
import { normalizeDate } from '../../utils/normalize-date';
import {
  generateCalendarMonth,
  navigateFocusedDate,
  navigateVisibleDate,
  type CalendarContext,
} from '../calendar-engine';
import { createValidationEngine, type ValidationEngine, type ValidationOptions } from '../validation-engine';

export interface DatePickerTimeOptions {
  enabled: boolean;
  defaultTime: TimeParts;
}

export interface DatePickerEngineOptions {
  weekStartsOn?: WeekStart;
  validation?: ValidationOptions;
  initialValue?: Date | null;
  time?: Partial<DatePickerTimeOptions>;
}

export interface DatePickerEngine {
  state: {
    value: Date | null;
    visibleDate: Date;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    toggle(): void;
    selectDate(date: Date): void;
    setTime(hours: number, minutes: number, seconds?: number): void;
    setValue(value: Date | null): void;
    navigate(direction: 'prev' | 'next'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
    updateTimeOptions(options: Partial<DatePickerTimeOptions>): void;
  };
  selectors: {
    getCalendarMonth(): CalendarMonth;
    isDateDisabled(date: Date): boolean;
    getTimeParts(): TimeParts;
  };
}

const defaultTimeOptions = (): DatePickerTimeOptions => ({
  enabled: false,
  defaultTime: { hours: 0, minutes: 0, seconds: 0 },
});

export function createDatePickerEngine(options: DatePickerEngineOptions = {}): DatePickerEngine {
  const validation: ValidationEngine = createValidationEngine(options.validation);
  const initial = options.initialValue ?? null;
  const timeOptions: DatePickerTimeOptions = {
    ...defaultTimeOptions(),
    ...options.time,
  };

  const normalizeValue = (value: Date | null): Date | null => {
    if (!value) {
      return null;
    }
    if (timeOptions.enabled) {
      return value;
    }
    return normalizeDate(value, 'day');
  };

  const state = {
    value: normalizeValue(initial),
    visibleDate: startOfMonth(initial ?? new Date()),
    focusedDate: initial ? normalizeDate(initial, 'day') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    selectedDate: state.value,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: DatePickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        if (!state.focusedDate && state.value) {
          state.focusedDate = normalizeDate(state.value, 'day');
        }
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(new Date(), 'day');
        }
      },
      close() {
        state.isOpen = false;
        state.hoverDate = null;
      },
      toggle() {
        state.isOpen ? engine.actions.close() : engine.actions.open();
      },
      selectDate(date: Date) {
        const day = normalizeDate(date, 'day');
        if (validation.isDateDisabled(day)) {
          return;
        }
        const nextValue = timeOptions.enabled
          ? mergeDayPreservingTime(day, state.value, timeOptions.defaultTime)
          : day;
        state.value = nextValue;
        state.focusedDate = day;
        state.visibleDate = startOfMonth(day);
        state.hoverDate = null;
        if (!timeOptions.enabled) {
          state.isOpen = false;
        }
      },
      setTime(hours: number, minutes: number, seconds = 0) {
        const day = state.value ?? state.focusedDate ?? normalizeDate(new Date(), 'day');
        const nextValue = mergeDateAndTime(day, hours, minutes, seconds);
        if (validation.isDateDisabled(normalizeDate(nextValue, 'day'))) {
          return;
        }
        state.value = nextValue;
        state.focusedDate = normalizeDate(nextValue, 'day');
        state.visibleDate = startOfMonth(nextValue);
        state.hoverDate = null;
      },
      setValue(value: Date | null) {
        state.value = normalizeValue(value);
        if (value) {
          state.visibleDate = startOfMonth(value);
          state.focusedDate = normalizeDate(value, 'day');
        }
      },
      navigate(direction: 'prev' | 'next') {
        state.visibleDate = navigateVisibleDate(state.visibleDate, direction, 'month');
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date;
        if (date) {
          state.visibleDate = startOfMonth(date);
        }
      },
      setHoverDate(date: Date | null) {
        state.hoverDate = date;
      },
      handleKeyDown(key: string) {
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(new Date(), 'day');
        }
        if (key === 'Escape') {
          engine.actions.close();
          return;
        }
        if (key === 'Enter' && state.focusedDate) {
          engine.actions.selectDate(state.focusedDate);
          return;
        }
        if (state.focusedDate) {
          const next = navigateFocusedDate(state.focusedDate, key, options.weekStartsOn ?? 0);
          if (!validation.isDateDisabled(next)) {
            state.focusedDate = next;
            state.visibleDate = startOfMonth(next);
          }
        }
      },
      updateValidation(validationOptions: Partial<ValidationOptions>) {
        validation.updateOptions(validationOptions);
      },
      updateTimeOptions(nextOptions: Partial<DatePickerTimeOptions>) {
        Object.assign(timeOptions, nextOptions);
        if (state.value && !timeOptions.enabled) {
          state.value = normalizeDate(state.value, 'day');
        }
      },
    },
    selectors: {
      getCalendarMonth() {
        return generateCalendarMonth(state.visibleDate, getContext(), {
          weekStartsOn: options.weekStartsOn,
          validation,
        });
      },
      isDateDisabled(date: Date) {
        return validation.isDateDisabled(date);
      },
      getTimeParts() {
        if (state.value) {
          return {
            hours: state.value.getHours(),
            minutes: state.value.getMinutes(),
            seconds: state.value.getSeconds(),
          };
        }
        return {
          hours: timeOptions.defaultTime.hours,
          minutes: timeOptions.defaultTime.minutes,
          seconds: timeOptions.defaultTime.seconds ?? 0,
        };
      },
    },
  };

  return engine;
}
