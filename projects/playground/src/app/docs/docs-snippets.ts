export const docsSnippets = {
  install: 'npm install ngx-flexible-date-picker date-fns',

  stylesImport: "@import 'ngx-flexible-date-picker/themes/flexible-date-picker.css';",

  quickStart: `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlexDatePickerComponent } from 'ngx-flexible-date-picker';

@Component({
  selector: 'app-demo',
  imports: [ReactiveFormsModule, FlexDatePickerComponent],
  template: \`
    <fdp-date-picker
      [formControl]="dateControl"
      placeholder="Select date"
      dateFormat="MMM d, yyyy"
      [showIcon]="true"
    />
  \`,
})
export class DemoComponent {
  dateControl = new FormControl<Date | null>(null);
}`,

  themeService: `import { FlexThemeService } from 'ngx-flexible-date-picker';

constructor(private theme: FlexThemeService) {}

enableDarkMode() {
  this.theme.setDarkMode(true);
}`,

  datePickerHtml: `<fdp-date-picker
  [formControl]="date"
  dateFormat="MMM d, yyyy"
  [time]="{ enabled: true, format: 'HH:mm', showSeconds: false }"
/>`,

  flexTimeConfig: `interface FlexTimeConfig {
  enabled?: boolean;       // default false
  format?: string;         // default 'HH:mm'
  minuteStep?: number;     // default 1
  hourStep?: number;       // default 1
  defaultTime?: { hours: number; minutes: number; seconds?: number };
  use24Hour?: boolean;     // default true
  showSeconds?: boolean;   // default false
}`,

  flexPresetSidebarConfig: `interface FlexPresetSidebarConfig {
  enabled?: boolean;         // default true
  presets?: PresetRange[];   // built-in defaults when omitted
}

interface PresetRange {
  id: string;
  label: string;
  getRange: (referenceDate?: Date) => DateRange;
}`,

  flexDateRangeCalendarConfig: `interface FlexDateRangeCalendarConfig {
  mode?: 'single' | 'double' | 'auto';  // default 'auto'
}`,

  reactiveForms: `readonly range = new FormControl<DateRange>({
  start: null,
  end: null,
});

<fdp-date-range-picker [formControl]="range" />`,

  templateDriven: `<fdp-date-picker [(ngModel)]="selectedDate" name="date" />`,

  localeService: `import { FlexLocaleService } from 'ngx-flexible-date-picker';

constructor(private locale: FlexLocaleService) {}

setFrench() {
  this.locale.setLocale('fr');
}

setArabic() {
  this.locale.setLocale('ar');
  document.documentElement.dir = 'rtl';
}`,

  headlessEngine: `import { createDatePickerEngine } from 'ngx-flexible-date-picker';

const engine = createDatePickerEngine({ weekStartsOn: 1 });
engine.actions.open();
engine.actions.selectDate(new Date(2026, 4, 13));
console.log(engine.state.value);`,

  apiComponents: `FlexDatePickerComponent
FlexDateRangePickerComponent
FlexTimePickerComponent
FlexTimeRangePickerComponent
FlexMonthPickerComponent
FlexMonthRangePickerComponent
FlexYearPickerComponent
FlexYearRangePickerComponent`,

  apiTypes: `DateRange, TimeRange, FlexTimeConfig
FlexPresetSidebarConfig, FlexDateRangeCalendarConfig
PresetRange, CalendarMonth, CalendarDay
Granularity, WeekStart, LocaleCode`,

  apiUtilities: `normalizeDate, mergeDateAndTime, getTimeParts
generateHourOptions, generateMinuteOptions
getWeekdayLabels, buildLoopedOptions`,

  featuresImport: `import {
  FlexDatePickerComponent,
  FlexDateRangePickerComponent,
  FlexTimePickerComponent,
  FlexThemeService,
  FlexLocaleService,
} from 'ngx-flexible-date-picker';`,
} as const;
