import type { CalendarMonthGrid } from '../../models';
import { normalizeDate } from '../../utils/normalize-date';
import {
  generateMonthGrid,
  navigateVisibleDate,
  type CalendarContext,
} from '../calendar-engine';
import {
  createValidationEngine,
  type ValidationEngine,
  type ValidationOptions,
} from '../validation-engine';

export interface MonthPickerEngineOptions {
  localeCode?: string;
  validation?: ValidationOptions;
  initialValue?: Date | null;
}

export interface MonthPickerEngine {
  state: {
    value: Date | null;
    visibleYear: number;
    focusedDate: Date | null;
    hoverDate: Date | null;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    toggle(): void;
    selectMonth(date: Date): void;
    setValue(value: Date | null): void;
    navigate(direction: 'prev' | 'next'): void;
    setFocusedDate(date: Date | null): void;
    setHoverDate(date: Date | null): void;
    handleKeyDown(key: string): void;
    updateValidation(options: Partial<ValidationOptions>): void;
  };
  selectors: {
    getMonthGrid(): CalendarMonthGrid;
    isMonthDisabled(date: Date): boolean;
  };
}

export function createMonthPickerEngine(
  options: MonthPickerEngineOptions = {},
): MonthPickerEngine {
  const validation: ValidationEngine = createValidationEngine({
    ...options.validation,
    granularity: 'month',
  });
  const initial = options.initialValue ?? null;
  const initialYear = initial?.getFullYear() ?? new Date().getFullYear();

  const state = {
    value: initial ? normalizeDate(initial, 'month') : null,
    visibleYear: initialYear,
    focusedDate: initial ? normalizeDate(initial, 'month') : null,
    hoverDate: null as Date | null,
    isOpen: false,
  };

  const getContext = (): CalendarContext => ({
    selectedDate: state.value,
    focusedDate: state.focusedDate,
    hoverDate: state.hoverDate,
  });

  const engine: MonthPickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        if (!state.focusedDate && state.value) {
          state.focusedDate = state.value;
        }
        if (!state.focusedDate) {
          state.focusedDate = normalizeDate(new Date(), 'month');
        }
        state.visibleYear =
          state.focusedDate?.getFullYear() ?? new Date().getFullYear();
      },
      close() {
        state.isOpen = false;
        state.hoverDate = null;
      },
      toggle() {
        state.isOpen ? engine.actions.close() : engine.actions.open();
      },
      selectMonth(date: Date) {
        const normalized = normalizeDate(date, 'month');
        if (validation.isDateDisabled(normalized)) {
          return;
        }
        state.value = normalized;
        state.focusedDate = normalized;
        state.visibleYear = normalized.getFullYear();
        state.isOpen = false;
        state.hoverDate = null;
      },
      setValue(value: Date | null) {
        state.value = value ? normalizeDate(value, 'month') : null;
        if (value) {
          state.visibleYear = value.getFullYear();
          state.focusedDate = normalizeDate(value, 'month');
        }
      },
      navigate(direction: 'prev' | 'next') {
        const next = navigateVisibleDate(
          new Date(state.visibleYear, 0, 1),
          direction,
          'year',
        );
        state.visibleYear = next.getFullYear();
      },
      setFocusedDate(date: Date | null) {
        state.focusedDate = date ? normalizeDate(date, 'month') : null;
      },
      setHoverDate(date: Date | null) {
        state.hoverDate = date ? normalizeDate(date, 'month') : null;
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
      getMonthGrid() {
        return generateMonthGrid(state.visibleYear, getContext(), {
          localeCode: options.localeCode,
          validation,
        });
      },
      isMonthDisabled(date: Date) {
        return validation.isDateDisabled(date);
      },
    },
  };

  return engine;
}
