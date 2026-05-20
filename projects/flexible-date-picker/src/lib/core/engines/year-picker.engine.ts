import type { CalendarYearGrid } from '../../models';
import { normalizeDate } from '../../utils/normalize-date';
import {
  generateYearGrid,
  getYearPageStart,
  navigateYearPage,
  type CalendarContext,
} from '../calendar-engine';
import { createValidationEngine, type ValidationEngine, type ValidationOptions } from '../validation-engine';

export interface YearPickerEngineOptions {
  validation?: ValidationOptions;
  initialValue?: Date | null;
}

export interface YearPickerEngine {
  state: {
    value: Date | null;
    pageStartYear: number;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    toggle(): void;
    selectYear(date: Date): void;
    setValue(value: Date | null): void;
    navigate(direction: 'prev' | 'next'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
  };
  selectors: {
    getYearGrid(): CalendarYearGrid;
    isYearDisabled(date: Date): boolean;
  };
}

export function createYearPickerEngine(options: YearPickerEngineOptions = {}): YearPickerEngine {
  const validation: ValidationEngine = createValidationEngine({
    ...options.validation,
    granularity: 'year',
  });
  const initial = options.initialValue ?? null;
  const initialYear = initial?.getFullYear() ?? new Date().getFullYear();

  const state = {
    value: initial ? normalizeDate(initial, 'year') : null,
    pageStartYear: getYearPageStart(initialYear),
    focusedDate: initial ? normalizeDate(initial, 'year') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    selectedDate: state.value,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: YearPickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        if (!state.focusedDate && state.value) {
          state.focusedDate = state.value;
        }
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(new Date(), 'year');
        }
        state.pageStartYear = getYearPageStart(
          state.focusedDate?.getFullYear() ?? new Date().getFullYear(),
        );
      },
      close() {
        state.isOpen = false;
        state.hoverDate = null;
      },
      toggle() {
        state.isOpen ? engine.actions.close() : engine.actions.open();
      },
      selectYear(date: Date) {
        const normalized = normalizeDate(date, 'year');
        if (validation.isDateDisabled(normalized)) {
          return;
        }
        state.value = normalized;
        state.focusedDate = normalized;
        state.pageStartYear = getYearPageStart(normalized.getFullYear());
        state.isOpen = false;
        state.hoverDate = null;
      },
      setValue(value: Date | null) {
        state.value = value ? normalizeDate(value, 'year') : null;
        if (value) {
          state.pageStartYear = getYearPageStart(value.getFullYear());
          state.focusedDate = normalizeDate(value, 'year');
        }
      },
      navigate(direction: 'prev' | 'next') {
        state.pageStartYear = navigateYearPage(state.pageStartYear, direction);
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date ? normalizeDate(date, 'year') : null;
      },
      setHoverDate(date: Date | null) {
        state.hoverDate = date ? normalizeDate(date, 'year') : null;
      },
      handleKeyDown(key: string) {
        if (key === 'Escape') {
          engine.actions.close();
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
    },
  };

  return engine;
}
