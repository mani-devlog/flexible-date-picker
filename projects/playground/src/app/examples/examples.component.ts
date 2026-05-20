import {
  ChangeDetectionStrategy,
  Component,
  signal,
  type WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  FlexDatePickerComponent,
  FlexDateRangePickerComponent,
  FlexMonthPickerComponent,
  FlexMonthRangePickerComponent,
  FlexTimePickerComponent,
  FlexTimeRangePickerComponent,
  FlexYearPickerComponent,
  FlexYearRangePickerComponent,
  normalizeDate,
  type FlexPresetSidebarConfig,
  type FlexDateRangeCalendarConfig,
  type FlexTimeConfig,
  type PresetRange,
  type TimeRange,
} from 'flexible-date-picker';
import { subDays } from 'date-fns';

interface BaseDatePlaygroundConfig {
  placeholder: string;
  dateFormat: string;
  useMinMax: boolean;
  disableWeekends: boolean;
  disabled: boolean;
  showIcon: boolean;
  timeEnabled: boolean;
  timeFormat: string;
}

interface DatePickerPlaygroundConfig extends BaseDatePlaygroundConfig {}

interface DateRangePickerPlaygroundConfig extends BaseDatePlaygroundConfig {
  presetSidebarMode: 'default' | 'custom' | 'hidden';
  calendarLayoutMode: 'auto' | 'single' | 'double';
}

interface MonthPickerPlaygroundConfig {
  placeholder: string;
  monthFormat: string;
  useMinMax: boolean;
  disabled: boolean;
  showIcon: boolean;
}

interface YearPickerPlaygroundConfig {
  placeholder: string;
  yearFormat: string;
  useMinMax: boolean;
  disabled: boolean;
  showIcon: boolean;
}

interface TimePickerPlaygroundConfig {
  placeholder: string;
  timeFormat: string;
  disabled: boolean;
  showIcon: boolean;
  minuteStep: number;
  use24Hour: boolean;
  showSeconds: boolean;
}

interface TimeRangePickerPlaygroundConfig extends TimePickerPlaygroundConfig {}

@Component({
  selector: 'app-examples',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    FlexDatePickerComponent,
    FlexDateRangePickerComponent,
    FlexMonthPickerComponent,
    FlexMonthRangePickerComponent,
    FlexTimePickerComponent,
    FlexTimeRangePickerComponent,
    FlexYearPickerComponent,
    FlexYearRangePickerComponent,
  ],
  templateUrl: './examples.component.html',
})
export class ExamplesComponent {
  readonly form = new FormGroup({
    date: new FormControl<Date | null>(new Date(2026, 4, 13), Validators.required),
    range: new FormControl<{ start: Date | null; end: Date | null }>({
      start: new Date(2026, 4, 12),
      end: new Date(2026, 4, 21),
    }),
    monthRange: new FormControl<{ start: Date | null; end: Date | null }>({
      start: new Date(2026, 4, 1),
      end: new Date(2026, 7, 1),
    }),
    month: new FormControl<Date | null>(new Date(2026, 4, 1)),
    time: new FormControl<Date | null>(new Date(2000, 0, 1, 14, 30)),
    timeRange: new FormControl<TimeRange>({
      start: new Date(2000, 0, 1, 9, 0),
      end: new Date(2000, 0, 1, 17, 30),
    }),
    year: new FormControl<Date | null>(new Date(2026, 0, 1)),
    yearRange: new FormControl<{ start: Date | null; end: Date | null }>({
      start: new Date(2024, 0, 1),
      end: new Date(2028, 0, 1),
    }),
  });

  ngModelDate: Date | null = new Date(2026, 4, 18);
  readonly minDate = new Date(2024, 0, 1);
  readonly maxDate = new Date(2026, 11, 31);
  readonly minMonth = new Date(2024, 0, 1);
  readonly maxMonth = new Date(2026, 11, 1);
  readonly minYear = new Date(2010, 0, 1);
  readonly maxYear = new Date(2035, 0, 1);

  readonly datePickerConfig = signal<DatePickerPlaygroundConfig>({
    placeholder: 'Select date',
    dateFormat: 'MMM d, yyyy',
    useMinMax: true,
    disableWeekends: false,
    disabled: false,
    showIcon: true,
    timeEnabled: false,
    timeFormat: 'HH:mm',
  });

  readonly ngModelDatePickerConfig = signal<DatePickerPlaygroundConfig>({
    placeholder: 'Pick a date',
    dateFormat: 'MMM d, yyyy',
    useMinMax: true,
    disableWeekends: false,
    disabled: false,
    showIcon: true,
    timeEnabled: false,
    timeFormat: 'HH:mm',
  });

  readonly dateRangePickerConfig = signal<DateRangePickerPlaygroundConfig>({
    placeholder: 'Select date range',
    dateFormat: 'MMM d, yyyy',
    useMinMax: true,
    disableWeekends: false,
    disabled: false,
    showIcon: true,
    timeEnabled: false,
    timeFormat: 'HH:mm',
    presetSidebarMode: 'default',
    calendarLayoutMode: 'auto',
  });

  readonly monthPickerConfig = signal<MonthPickerPlaygroundConfig>({
    placeholder: 'Select month',
    monthFormat: 'MMM yyyy',
    useMinMax: true,
    disabled: false,
    showIcon: true,
  });

  readonly monthRangePickerConfig = signal<MonthPickerPlaygroundConfig>({
    placeholder: 'Select month range',
    monthFormat: 'MMM yyyy',
    useMinMax: true,
    disabled: false,
    showIcon: true,
  });

  readonly yearPickerConfig = signal<YearPickerPlaygroundConfig>({
    placeholder: 'Select year',
    yearFormat: 'yyyy',
    useMinMax: true,
    disabled: false,
    showIcon: true,
  });

  readonly yearRangePickerConfig = signal<YearPickerPlaygroundConfig>({
    placeholder: 'Select year range',
    yearFormat: 'yyyy',
    useMinMax: true,
    disabled: false,
    showIcon: true,
  });

  readonly timePickerConfig = signal<TimePickerPlaygroundConfig>({
    placeholder: 'Select time',
    timeFormat: 'HH:mm',
    disabled: false,
    showIcon: true,
    minuteStep: 1,
    use24Hour: true,
    showSeconds: true,
  });

  readonly timeRangePickerConfig = signal<TimeRangePickerPlaygroundConfig>({
    placeholder: 'Select time range',
    timeFormat: 'HH:mm',
    disabled: false,
    showIcon: true,
    minuteStep: 1,
    use24Hour: true,
    showSeconds: true,
  });

  readonly timeFormatOptions = [
    { value: 'HH:mm', label: 'HH:mm (24h)' },
    { value: 'HH:mm:ss', label: 'HH:mm:ss (24h)' },
    { value: 'h:mm a', label: 'h:mm a (12h)' },
    { value: 'h:mm:ss a', label: 'h:mm:ss a (12h)' },
  ];

  readonly dateFormatOptions = [
    { value: 'MMM d, yyyy', label: 'MMM d, yyyy' },
    { value: 'PP', label: 'PP (localized)' },
    { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
    { value: 'EEEE, MMM d, yyyy', label: 'EEEE, MMM d, yyyy' },
  ];

  readonly monthFormatOptions = [
    { value: 'MMM yyyy', label: 'MMM yyyy' },
    { value: 'MMMM yyyy', label: 'MMMM yyyy' },
    { value: 'MM/yyyy', label: 'MM/yyyy' },
  ];

  readonly yearFormatOptions = [
    { value: 'yyyy', label: 'yyyy' },
    { value: 'yy', label: 'yy' },
  ];

  readonly customRangePresets: PresetRange[] = [
    {
      id: 'last14',
      label: 'Last 14 Days',
      getRange: (ref = new Date()) => ({
        start: normalizeDate(subDays(ref, 13), 'day'),
        end: normalizeDate(ref, 'day'),
      }),
    },
    {
      id: 'last90',
      label: 'Last 90 Days',
      getRange: (ref = new Date()) => ({
        start: normalizeDate(subDays(ref, 89), 'day'),
        end: normalizeDate(ref, 'day'),
      }),
    },
  ];

  updatePickerConfig<T>(configSignal: WritableSignal<T>, patch: Partial<T>): void {
    configSignal.update((current) => ({ ...current, ...patch }));
  }

  dateMin(config: BaseDatePlaygroundConfig): Date | null {
    return config.useMinMax ? this.minDate : null;
  }

  dateMax(config: BaseDatePlaygroundConfig): Date | null {
    return config.useMinMax ? this.maxDate : null;
  }

  monthMin(config: MonthPickerPlaygroundConfig): Date | null {
    return config.useMinMax ? this.minMonth : null;
  }

  monthMax(config: MonthPickerPlaygroundConfig): Date | null {
    return config.useMinMax ? this.maxMonth : null;
  }

  yearMin(config: YearPickerPlaygroundConfig): Date | null {
    return config.useMinMax ? this.minYear : null;
  }

  yearMax(config: YearPickerPlaygroundConfig): Date | null {
    return config.useMinMax ? this.maxYear : null;
  }

  dateDisabledFn(config: BaseDatePlaygroundConfig): ((date: Date) => boolean) | undefined {
    return config.disableWeekends ? this.isWeekend.bind(this) : undefined;
  }

  dateRangePresetSidebar(config: DateRangePickerPlaygroundConfig): FlexPresetSidebarConfig {
    if (config.presetSidebarMode === 'hidden') {
      return { enabled: false };
    }
    if (config.presetSidebarMode === 'custom') {
      return { enabled: true, presets: this.customRangePresets };
    }
    return { enabled: true };
  }

  dateRangeCalendarLayout(config: DateRangePickerPlaygroundConfig): FlexDateRangeCalendarConfig {
    return { mode: config.calendarLayoutMode };
  }

  dateTimeConfig(config: BaseDatePlaygroundConfig): FlexTimeConfig {
    return {
      enabled: config.timeEnabled,
      format: config.timeFormat,
      minuteStep: 1,
      use24Hour: config.timeFormat.startsWith('HH'),
      showSeconds: config.timeFormat.includes('ss'),
    };
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
}
