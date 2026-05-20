import type { CalendarMonthGrid, DateRange, PresetRange } from '../../models';
import type { WeekStart } from '../../types';
import { DEFAULT_MONTH_PRESET_RANGES } from '../../utils/preset-ranges';
import { normalizeDate } from '../../utils/normalize-date';
import { selectRangeDate } from '../../utils/range-utils';
import { generateMonthGrid, navigateVisibleDate, type CalendarContext } from '../calendar-engine';
import { createValidationEngine, type ValidationEngine, type ValidationOptions } from '../validation-engine';

export interface MonthRangePickerEngineOptions {
  weekStartsOn?: WeekStart;
  localeCode?: string;
  validation?: ValidationOptions;
  initialValue?: DateRange;
  presets?: PresetRange[];
}

export interface MonthRangePickerEngine {
  state: {
    value: DateRange;
    draftValue: DateRange;
    visibleYear: number;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    apply(): void;
    cancel(): void;
    selectMonth(date: Date): void;
    setValue(value: DateRange): void;
    navigate(direction: 'prev' | 'next'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    applyPreset(preset: PresetRange): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
  };
  selectors: {
    getMonthGrid(): CalendarMonthGrid;
    getPresets(): PresetRange[];
    isMonthDisabled(date: Date): boolean;
    isRangeValid(): boolean;
  };
}

const emptyRange = (): DateRange => ({ start: null, end: null });

export function createMonthRangePickerEngine(
  options: MonthRangePickerEngineOptions = {},
): MonthRangePickerEngine {
  const validation: ValidationEngine = createValidationEngine({
    ...options.validation,
    granularity: 'month',
  });
  const initial = options.initialValue ?? emptyRange();

  const state = {
    value: { ...initial },
    draftValue: { ...initial },
    visibleYear: (initial.start ?? new Date()).getFullYear(),
    focusedDate: initial.start ? normalizeDate(initial.start, 'month') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    range: state.draftValue,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: MonthRangePickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        state.draftValue = { ...state.value };
      },
      close() {
        state.isOpen = false;
        state.hoverDate = null;
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
      selectMonth(date: Date) {
        const normalized = normalizeDate(date, 'month');
        if (validation.isDateDisabled(normalized)) {
          return;
        }
        state.draftValue = selectRangeDate(state.draftValue, normalized, 'month');
        state.focusedDate = normalized;
        state.visibleYear = normalized.getFullYear();
      },
      setValue(value: DateRange) {
        state.value = {
          start: value.start ? normalizeDate(value.start, 'month') : null,
          end: value.end ? normalizeDate(value.end, 'month') : null,
        };
        state.draftValue = { ...state.value };
        if (value.start) {
          state.visibleYear = value.start.getFullYear();
        }
      },
      navigate(direction: 'prev' | 'next') {
        const next = navigateVisibleDate(new Date(state.visibleYear, 0, 1), direction, 'year');
        state.visibleYear = next.getFullYear();
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date ? normalizeDate(date, 'month') : null;
      },
      setHoverDate(date: Date | null) {
        const normalized = date ? normalizeDate(date, 'month') : null;
        const prev = state.hoverDate?.getTime() ?? null;
        const next = normalized?.getTime() ?? null;
        if (prev === next) {
          return;
        }
        state.hoverDate = normalized;
      },
      applyPreset(preset: PresetRange) {
        const range = preset.getRange();
        state.draftValue = {
          start: range.start ? normalizeDate(range.start, 'month') : null,
          end: range.end ? normalizeDate(range.end, 'month') : null,
        };
        if (range.start) {
          state.visibleYear = range.start.getFullYear();
          state.focusedDate = normalizeDate(range.start, 'month');
        }
      },
      handleKeyDown(key: string) {
        if (key === 'Escape') {
          engine.actions.cancel();
        }
      },
      updateValidation(validationOptions: Partial<ValidationOptions>) {
        validation.updateOptions(validationOptions);
      },
    },
    selectors: {
      getMonthGrid() {
        return generateMonthGrid(state.visibleYear, getContext(), {
          localeCode: options.localeCode,
          validation,
        });
      },
      isMonthDisabled(date: Date) {
        return validation.isDateDisabled(date);
      },
      isRangeValid() {
        return validation.isRangeValid(state.draftValue);
      },
      getPresets() {
        return options.presets ?? DEFAULT_MONTH_PRESET_RANGES;
      },
    },
  };

  return engine;
}
