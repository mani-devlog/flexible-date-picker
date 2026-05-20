import type { CalendarYearGrid, DateRange, PresetRange } from '../../models';
import { DEFAULT_YEAR_PRESET_RANGES } from '../../utils/preset-ranges';
import { normalizeDate } from '../../utils/normalize-date';
import { selectRangeDate } from '../../utils/range-utils';
import {
  generateYearGrid,
  getYearPageStart,
  navigateYearPage,
  type CalendarContext,
} from '../calendar-engine';
import { createValidationEngine, type ValidationEngine, type ValidationOptions } from '../validation-engine';

export interface YearRangePickerEngineOptions {
  validation?: ValidationOptions;
  initialValue?: DateRange;
  presets?: PresetRange[];
}

export interface YearRangePickerEngine {
  state: {
    value: DateRange;
    draftValue: DateRange;
    pageStartYear: number;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    apply(): void;
    cancel(): void;
    selectYear(date: Date): void;
    setValue(value: DateRange): void;
    navigate(direction: 'prev' | 'next'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    applyPreset(preset: PresetRange): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
  };
  selectors: {
    getYearGrid(): CalendarYearGrid;
    getPresets(): PresetRange[];
    isYearDisabled(date: Date): boolean;
    isRangeValid(): boolean;
  };
}

const emptyRange = (): DateRange => ({ start: null, end: null });

export function createYearRangePickerEngine(
  options: YearRangePickerEngineOptions = {},
): YearRangePickerEngine {
  const validation: ValidationEngine = createValidationEngine({
    ...options.validation,
    granularity: 'year',
  });
  const initial = options.initialValue ?? emptyRange();

  const state = {
    value: { ...initial },
    draftValue: { ...initial },
    pageStartYear: getYearPageStart((initial.start ?? new Date()).getFullYear()),
    focusedDate: initial.start ? normalizeDate(initial.start, 'year') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    range: state.draftValue,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: YearRangePickerEngine = {
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
      selectYear(date: Date) {
        const normalized = normalizeDate(date, 'year');
        if (validation.isDateDisabled(normalized)) {
          return;
        }
        state.draftValue = selectRangeDate(state.draftValue, normalized, 'year');
        state.focusedDate = normalized;
        state.pageStartYear = getYearPageStart(normalized.getFullYear());
      },
      setValue(value: DateRange) {
        state.value = {
          start: value.start ? normalizeDate(value.start, 'year') : null,
          end: value.end ? normalizeDate(value.end, 'year') : null,
        };
        state.draftValue = { ...state.value };
        if (value.start) {
          state.pageStartYear = getYearPageStart(value.start.getFullYear());
        }
      },
      navigate(direction: 'prev' | 'next') {
        state.pageStartYear = navigateYearPage(state.pageStartYear, direction);
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date ? normalizeDate(date, 'year') : null;
      },
      setHoverDate(date: Date | null) {
        const normalized = date ? normalizeDate(date, 'year') : null;
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
          start: range.start ? normalizeDate(range.start, 'year') : null,
          end: range.end ? normalizeDate(range.end, 'year') : null,
        };
        if (range.start) {
          state.pageStartYear = getYearPageStart(range.start.getFullYear());
          state.focusedDate = normalizeDate(range.start, 'year');
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
      getYearGrid() {
        return generateYearGrid(state.pageStartYear, getContext(), { validation });
      },
      isYearDisabled(date: Date) {
        return validation.isDateDisabled(date);
      },
      isRangeValid() {
        return validation.isRangeValid(state.draftValue);
      },
      getPresets() {
        return options.presets ?? DEFAULT_YEAR_PRESET_RANGES;
      },
    },
  };

  return engine;
}
