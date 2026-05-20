export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  weeks: CalendarWeek[];
  month: number;
  year: number;
}

export interface CalendarMonthCell {
  date: Date;
  month: number;
  year: number;
  label: string;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

export interface CalendarMonthGrid {
  year: number;
  months: CalendarMonthCell[];
}

export interface CalendarYearCell {
  date: Date;
  year: number;
  label: string;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isToday: boolean;
}

export interface CalendarYearGrid {
  startYear: number;
  endYear: number;
  years: CalendarYearCell[];
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface PickerState<TValue> {
  value: TValue;
  visibleDate: Date;
  focusedDate: Date | null;
  hoverDate: Date | null;
  isOpen: boolean;
}

export interface PresetRange {
  id: string;
  label: string;
  getRange: (referenceDate?: Date) => DateRange;
}

/** Configuration for the preset shortcut sidebar in range pickers. */
export interface FlexPresetSidebarConfig {
  /** Show the preset sidebar. Default: true. */
  enabled?: boolean;
  /** Preset items. Uses built-in defaults when omitted. Pass `[]` for none. */
  presets?: PresetRange[];
}

/** Configuration for date range picker calendar panels. */
export interface FlexDateRangeCalendarConfig {
  /**
   * Calendar layout mode.
   * - `auto`: two panels on desktop, one on mobile (default)
   * - `single`: one month panel
   * - `double`: two consecutive month panels
   */
  mode?: 'single' | 'double' | 'auto';
}

/** Time-of-day configuration for date/time pickers. */
export interface FlexTimeConfig {
  /** Enable time selection alongside dates. Default: false. */
  enabled?: boolean;
  /** date-fns format for the time segment. Default: `HH:mm`. */
  format?: string;
  /** Step between minute options. Default: 1. */
  minuteStep?: number;
  /** Step between hour options. Default: 1. */
  hourStep?: number;
  /** Default time when none is set. Default: `{ hours: 0, minutes: 0 }`. */
  defaultTime?: { hours: number; minutes: number; seconds?: number };
  /** Use 24-hour drum columns. Default: true. */
  use24Hour?: boolean;
  /** Show seconds column. Default: false. */
  showSeconds?: boolean;
}

export interface TimeRange {
  start: Date | null;
  end: Date | null;
}
