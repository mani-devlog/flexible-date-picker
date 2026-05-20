import { addMonths, startOfMonth } from 'date-fns';
import type { CalendarMonth, DateRange, PresetRange } from '../../models';
import type { WeekStart } from '../../types';
import { DEFAULT_PRESET_RANGES } from '../../utils/preset-ranges';
import { normalizeDate } from '../../utils/normalize-date';
import { selectRangeDate } from '../../utils/range-utils';
import {
  mergeDateAndTime,
  mergeDayPreservingTime,
  type TimeParts,
} from '../../utils/time-utils';
import {
  generateCalendarMonth,
  navigateFocusedDate,
  navigateVisibleDate,
  type CalendarContext,
} from '../calendar-engine';
import { createValidationEngine, type ValidationEngine, type ValidationOptions } from '../validation-engine';

export interface DateRangeTimeOptions {
  enabled: boolean;
  defaultStartTime: TimeParts;
  defaultEndTime: TimeParts;
}

export interface DateRangePickerEngineOptions {
  weekStartsOn?: WeekStart;
  validation?: ValidationOptions;
  initialValue?: DateRange;
  presets?: PresetRange[];
  time?: Partial<DateRangeTimeOptions>;
}

export interface DateRangePickerEngine {
  state: {
    value: DateRange;
    draftValue: DateRange;
    visibleDate: Date;
    secondVisibleDate: Date;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    apply(): void;
    cancel(): void;
    selectDate(date: Date): void;
    setStartTime(hours: number, minutes: number, seconds?: number): void;
    setEndTime(hours: number, minutes: number, seconds?: number): void;
    setValue(value: DateRange): void;
    setDraftValue(value: DateRange): void;
    navigate(direction: 'prev' | 'next', panel?: 'first' | 'second'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    applyPreset(preset: PresetRange): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
    updateTimeOptions(options: Partial<DateRangeTimeOptions>): void;
  };
  selectors: {
    getFirstCalendarMonth(): CalendarMonth;
    getSecondCalendarMonth(): CalendarMonth;
    getPresets(): PresetRange[];
    isDateDisabled(date: Date): boolean;
    isRangeValid(): boolean;
    getStartTimeParts(): TimeParts;
    getEndTimeParts(): TimeParts;
  };
}

const emptyRange = (): DateRange => ({ start: null, end: null });

const defaultRangeTimeOptions = (): DateRangeTimeOptions => ({
  enabled: false,
  defaultStartTime: { hours: 0, minutes: 0, seconds: 0 },
  defaultEndTime: { hours: 23, minutes: 59, seconds: 59 },
});

export function createDateRangePickerEngine(
  options: DateRangePickerEngineOptions = {},
): DateRangePickerEngine {
  const validation: ValidationEngine = createValidationEngine(options.validation);
  const initial = options.initialValue ?? emptyRange();
  const timeOptions: DateRangeTimeOptions = {
    ...defaultRangeTimeOptions(),
    ...options.time,
  };

  const normalizeRange = (value: DateRange): DateRange => {
    if (!timeOptions.enabled) {
      return {
        start: value.start ? normalizeDate(value.start, 'day') : null,
        end: value.end ? normalizeDate(value.end, 'day') : null,
      };
    }
    return {
      start: value.start ?? null,
      end: value.end ?? null,
    };
  };

  const mergeRangeTimes = (value: DateRange): DateRange => {
    if (!timeOptions.enabled) {
      return value;
    }
    return {
      start: value.start
        ? mergeDayPreservingTime(
            normalizeDate(value.start, 'day'),
            value.start,
            timeOptions.defaultStartTime,
          )
        : null,
      end: value.end
        ? mergeDayPreservingTime(
            normalizeDate(value.end, 'day'),
            value.end,
            timeOptions.defaultEndTime,
          )
        : null,
    };
  };

  const state = {
    value: normalizeRange(initial),
    draftValue: normalizeRange(initial),
    visibleDate: startOfMonth(initial.start ?? new Date()),
    secondVisibleDate: startOfMonth(addMonths(initial.start ?? new Date(), 1)),
    focusedDate: initial.start ? normalizeDate(initial.start, 'day') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    range: state.draftValue,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: DateRangePickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        state.draftValue = { ...state.value };
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(state.draftValue.start ?? new Date(), 'day');
        }
      },
      close() {
        state.isOpen = false;
        state.hoverDate = null;
        state.draftValue = { ...state.value };
      },
      apply() {
        if (validation.isRangeValid(state.draftValue)) {
          state.value = { ...state.draftValue };
          state.isOpen = false;
          state.hoverDate = null;
        }
      },
      cancel() {
        state.draftValue = { ...state.value };
        state.isOpen = false;
        state.hoverDate = null;
      },
      selectDate(date: Date) {
        const day = normalizeDate(date, 'day');
        if (validation.isDateDisabled(day)) {
          return;
        }
        const next = selectRangeDate(state.draftValue, day, 'day');
        state.draftValue = timeOptions.enabled ? mergeRangeTimes(next) : next;
        state.focusedDate = day;
      },
      setStartTime(hours: number, minutes: number, seconds = 0) {
        const day = state.draftValue.start ?? state.focusedDate ?? normalizeDate(new Date(), 'day');
        state.draftValue = {
          ...state.draftValue,
          start: mergeDateAndTime(day, hours, minutes, seconds),
        };
      },
      setEndTime(hours: number, minutes: number, seconds = 0) {
        const day = state.draftValue.end ?? state.draftValue.start ?? state.focusedDate ?? normalizeDate(new Date(), 'day');
        state.draftValue = {
          ...state.draftValue,
          end: mergeDateAndTime(day, hours, minutes, seconds),
        };
      },
      setValue(value: DateRange) {
        state.value = normalizeRange(value);
        state.draftValue = { ...state.value };
        if (value.start) {
          state.visibleDate = startOfMonth(value.start);
          state.secondVisibleDate = startOfMonth(addMonths(value.start, 1));
        }
      },
      setDraftValue(value: DateRange) {
        state.draftValue = normalizeRange(value);
      },
      navigate(direction: 'prev' | 'next', panel: 'first' | 'second' = 'first') {
        if (panel === 'second') {
          state.secondVisibleDate = navigateVisibleDate(state.secondVisibleDate, direction, 'month');
        } else {
          state.visibleDate = navigateVisibleDate(state.visibleDate, direction, 'month');
          state.secondVisibleDate = addMonths(state.visibleDate, 1);
        }
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date;
      },
      setHoverDate(date: Date | null) {
        const prev = state.hoverDate?.getTime() ?? null;
        const next = date?.getTime() ?? null;
        if (prev === next) {
          return;
        }
        state.hoverDate = date;
      },
      applyPreset(preset: PresetRange) {
        const range = preset.getRange();
        state.draftValue = normalizeRange(range);
        if (range.start) {
          state.visibleDate = startOfMonth(range.start);
          state.secondVisibleDate = startOfMonth(addMonths(range.start, 1));
          state.focusedDate = normalizeDate(range.start, 'day');
        }
      },
      handleKeyDown(key: string) {
        if (key === 'Escape') {
          engine.actions.cancel();
          return;
        }
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(new Date(), 'day');
        }
        if (key === 'Enter' && state.focusedDate) {
          engine.actions.selectDate(state.focusedDate);
          return;
        }
        if (state.focusedDate) {
          const next = navigateFocusedDate(state.focusedDate, key, options.weekStartsOn ?? 0);
          if (!validation.isDateDisabled(next)) {
            state.focusedDate = next;
          }
        }
      },
      updateValidation(validationOptions: Partial<ValidationOptions>) {
        validation.updateOptions(validationOptions);
      },
      updateTimeOptions(nextOptions: Partial<DateRangeTimeOptions>) {
        Object.assign(timeOptions, nextOptions);
        if (!timeOptions.enabled) {
          state.value = normalizeRange(state.value);
          state.draftValue = normalizeRange(state.draftValue);
        }
      },
    },
    selectors: {
      getFirstCalendarMonth() {
        return generateCalendarMonth(state.visibleDate, getContext(), {
          weekStartsOn: options.weekStartsOn,
          validation,
        });
      },
      getSecondCalendarMonth() {
        return generateCalendarMonth(state.secondVisibleDate, getContext(), {
          weekStartsOn: options.weekStartsOn,
          validation,
        });
      },
      getPresets() {
        return options.presets ?? DEFAULT_PRESET_RANGES;
      },
      isDateDisabled(date: Date) {
        return validation.isDateDisabled(date);
      },
      isRangeValid() {
        return validation.isRangeValid(state.draftValue);
      },
      getStartTimeParts() {
        if (state.draftValue.start) {
          return {
            hours: state.draftValue.start.getHours(),
            minutes: state.draftValue.start.getMinutes(),
            seconds: state.draftValue.start.getSeconds(),
          };
        }
        return {
          hours: timeOptions.defaultStartTime.hours,
          minutes: timeOptions.defaultStartTime.minutes,
          seconds: timeOptions.defaultStartTime.seconds ?? 0,
        };
      },
      getEndTimeParts() {
        if (state.draftValue.end) {
          return {
            hours: state.draftValue.end.getHours(),
            minutes: state.draftValue.end.getMinutes(),
            seconds: state.draftValue.end.getSeconds(),
          };
        }
        return {
          hours: timeOptions.defaultEndTime.hours,
          minutes: timeOptions.defaultEndTime.minutes,
          seconds: timeOptions.defaultEndTime.seconds ?? 59,
        };
      },
    },
  };

  return engine;
}
