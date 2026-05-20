import {
  createTimeValue,
  getTimeParts,
  isTimeRangeValid,
  TIME_REFERENCE_DATE,
  type TimeParts,
} from '../../utils/time-utils';

export interface TimePickerEngineOptions {
  initialValue?: Date | null;
  defaultTime?: TimeParts;
}

export interface TimePickerEngine {
  state: {
    value: Date | null;
    draftHours: number;
    draftMinutes: number;
    draftSeconds: number;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    toggle(): void;
    setValue(value: Date | null): void;
    setDraftTime(hours: number, minutes: number, seconds?: number): void;
    apply(): void;
    cancel(): void;
  };
}

export function createTimePickerEngine(
  options: TimePickerEngineOptions = {},
): TimePickerEngine {
  const defaultTime = options.defaultTime ?? { hours: 0, minutes: 0, seconds: 0 };
  const initial = options.initialValue ?? null;
  const initialParts = initial ? getTimeParts(initial) : defaultTime;

  const state = {
    value: initial,
    draftHours: initialParts.hours,
    draftMinutes: initialParts.minutes,
    draftSeconds: initialParts.seconds,
    isOpen: false,
  };

  const engine: TimePickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        const parts = state.value ? getTimeParts(state.value) : defaultTime;
        state.draftHours = parts.hours;
        state.draftMinutes = parts.minutes;
        state.draftSeconds = parts.seconds;
      },
      close() {
        state.isOpen = false;
      },
      toggle() {
        state.isOpen ? engine.actions.close() : engine.actions.open();
      },
      setValue(value: Date | null) {
        state.value = value
          ? createTimeValue(value.getHours(), value.getMinutes(), value.getSeconds())
          : null;
        if (value) {
          const parts = getTimeParts(value);
          state.draftHours = parts.hours;
          state.draftMinutes = parts.minutes;
          state.draftSeconds = parts.seconds;
        }
      },
      setDraftTime(hours: number, minutes: number, seconds = state.draftSeconds) {
        state.draftHours = hours;
        state.draftMinutes = minutes;
        state.draftSeconds = seconds;
      },
      apply() {
        state.value = createTimeValue(state.draftHours, state.draftMinutes, state.draftSeconds);
        state.isOpen = false;
      },
      cancel() {
        const parts = state.value ? getTimeParts(state.value) : defaultTime;
        state.draftHours = parts.hours;
        state.draftMinutes = parts.minutes;
        state.draftSeconds = parts.seconds;
        state.isOpen = false;
      },
    },
  };

  return engine;
}

export interface TimeRangePickerEngineOptions {
  initialValue?: { start: Date | null; end: Date | null };
  defaultTime?: TimeParts;
}

export interface TimeRangePickerEngine {
  state: {
    value: { start: Date | null; end: Date | null };
    draftValue: { start: Date | null; end: Date | null };
    draftStartHours: number;
    draftStartMinutes: number;
    draftStartSeconds: number;
    draftEndHours: number;
    draftEndMinutes: number;
    draftEndSeconds: number;
    isOpen: boolean;
  };
  actions: {
    open(): void;
    close(): void;
    toggle(): void;
    setValue(value: { start: Date | null; end: Date | null }): void;
    setDraftStart(hours: number, minutes: number, seconds?: number): void;
    setDraftEnd(hours: number, minutes: number, seconds?: number): void;
    apply(): void;
    cancel(): void;
  };
  selectors: {
    isRangeValid(): boolean;
  };
}

const emptyTimeRange = () => ({ start: null as Date | null, end: null as Date | null });

export function createTimeRangePickerEngine(
  options: TimeRangePickerEngineOptions = {},
): TimeRangePickerEngine {
  const defaultTime = options.defaultTime ?? { hours: 0, minutes: 0, seconds: 0 };
  const initial = options.initialValue ?? emptyTimeRange();

  const syncDraftFromValue = (target = state) => {
    const startParts = target.draftValue.start
      ? getTimeParts(target.draftValue.start)
      : defaultTime;
    const endParts = target.draftValue.end
      ? getTimeParts(target.draftValue.end)
      : { hours: 23, minutes: 59, seconds: 59 };
    target.draftStartHours = startParts.hours;
    target.draftStartMinutes = startParts.minutes;
    target.draftStartSeconds = startParts.seconds;
    target.draftEndHours = endParts.hours;
    target.draftEndMinutes = endParts.minutes;
    target.draftEndSeconds = endParts.seconds;
  };

  const normalizeTimeRange = (value: { start: Date | null; end: Date | null }) => ({
    start: value.start
      ? createTimeValue(value.start.getHours(), value.start.getMinutes(), value.start.getSeconds())
      : null,
    end: value.end
      ? createTimeValue(value.end.getHours(), value.end.getMinutes(), value.end.getSeconds())
      : null,
  });

  const state = {
    value: normalizeTimeRange(initial),
    draftValue: normalizeTimeRange(initial),
    draftStartHours: defaultTime.hours,
    draftStartMinutes: defaultTime.minutes,
    draftStartSeconds: defaultTime.seconds,
    draftEndHours: 23,
    draftEndMinutes: 59,
    draftEndSeconds: 59,
    isOpen: false,
  };

  const engine: TimeRangePickerEngine = {
    state,
    actions: {
      open() {
        state.isOpen = true;
        state.draftValue = { ...state.value };
        syncDraftFromValue();
      },
      close() {
        state.isOpen = false;
      },
      toggle() {
        state.isOpen ? engine.actions.close() : engine.actions.open();
      },
      setValue(value) {
        state.value = normalizeTimeRange(value);
        state.draftValue = { ...state.value };
        syncDraftFromValue();
      },
      setDraftStart(hours: number, minutes: number, seconds = state.draftStartSeconds) {
        state.draftStartHours = hours;
        state.draftStartMinutes = minutes;
        state.draftStartSeconds = seconds;
        state.draftValue = {
          ...state.draftValue,
          start: createTimeValue(hours, minutes, seconds),
        };
      },
      setDraftEnd(hours: number, minutes: number, seconds = state.draftEndSeconds) {
        state.draftEndHours = hours;
        state.draftEndMinutes = minutes;
        state.draftEndSeconds = seconds;
        state.draftValue = {
          ...state.draftValue,
          end: createTimeValue(hours, minutes, seconds),
        };
      },
      apply() {
        if (engine.selectors.isRangeValid()) {
          state.value = { ...state.draftValue };
          state.isOpen = false;
        }
      },
      cancel() {
        state.draftValue = { ...state.value };
        syncDraftFromValue();
        state.isOpen = false;
      },
    },
    selectors: {
      isRangeValid() {
        return isTimeRangeValid(state.draftValue.start, state.draftValue.end);
      },
    },
  };

  syncDraftFromValue();

  return engine;
}

export { TIME_REFERENCE_DATE };
