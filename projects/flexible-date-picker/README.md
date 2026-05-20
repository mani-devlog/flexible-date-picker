# ngx-flexible-date-picker

Flexible date and time pickers for **Angular 20+**. Eight standalone components (date, time, month, year — single and range), headless selection engines, reactive forms support, light/dark theming, and locale/RTL layout.

Built with [date-fns](https://date-fns.org/) for formatting and calendar math.

## Requirements

| Dependency | Version |
|------------|---------|
| `@angular/common` | `^20.3.0` |
| `@angular/core` | `^20.3.0` |
| `date-fns` | `^4.x` (required at runtime) |

## Installation

```bash
npm install ngx-flexible-date-picker date-fns
```

Import the stylesheet in your global styles (required):

```css
@import 'ngx-flexible-date-picker/themes/flexible-date-picker.css';
```

## Quick start

Import a picker as a standalone component and bind it with reactive forms:

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlexDatePickerComponent } from 'ngx-flexible-date-picker';

@Component({
  selector: 'app-demo',
  imports: [ReactiveFormsModule, FlexDatePickerComponent],
  template: `
    <fdp-date-picker
      [formControl]="dateControl"
      placeholder="Select date"
      dateFormat="MMM d, yyyy"
      [showIcon]="true"
    />
  `,
})
export class DemoComponent {
  dateControl = new FormControl<Date | null>(null);
}
```

Template-driven forms work with `[(ngModel)]` the same way.

## Components

All pickers use the `fdp-*` selector prefix and implement `ControlValueAccessor`.

| Selector | Value type | Output |
|----------|------------|--------|
| `fdp-date-picker` | `Date \| null` | `dateChange` |
| `fdp-date-range-picker` | `{ start: Date \| null; end: Date \| null }` | `rangeChange` |
| `fdp-time-picker` | `Date \| null` | `timeChange` |
| `fdp-time-range-picker` | `TimeRange` | `rangeChange` |
| `fdp-month-picker` | `Date \| null` (first of month) | `monthChange` |
| `fdp-month-range-picker` | `DateRange` | `rangeChange` |
| `fdp-year-picker` | `Date \| null` (Jan 1) | `yearChange` |
| `fdp-year-range-picker` | `DateRange` | `rangeChange` |

### Date picker

```html
<fdp-date-picker
  [formControl]="date"
  dateFormat="MMM d, yyyy"
  [min]="minDate"
  [max]="maxDate"
  [time]="{ enabled: true, format: 'HH:mm', showSeconds: false }"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `'Select date'` | Empty-state label |
| `dateFormat` | `string` | `'MMM d, yyyy'` | [date-fns](https://date-fns.org/docs/format) display format |
| `min` / `max` | `Date \| null` | `null` | Selectable bounds |
| `isDateDisabled` | `(date: Date) => boolean` | — | Custom disabled dates |
| `time` | `FlexTimeConfig` | `{}` | Optional inline time drum |
| `disabled` | `boolean` | `false` | Disable trigger |
| `showIcon` | `boolean` | `true` | Show calendar icon |

### Date range picker

Includes preset shortcuts (Last 7 days, This month, etc.), responsive dual-calendar layout, and Apply/Cancel actions.

```html
<fdp-date-range-picker
  [formControl]="range"
  [presetSidebar]="{ enabled: true }"
  [calendarLayout]="{ mode: 'auto' }"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `'Select date range'` | Empty-state label |
| `dateFormat` | `string` | `'MMM d, yyyy'` | Display format |
| `min` / `max` | `Date \| null` | `null` | Bounds for both ends |
| `isDateDisabled` | `Function` | — | Disable specific dates |
| `presetSidebar` | `FlexPresetSidebarConfig` | `{}` | Preset shortcuts panel |
| `calendarLayout` | `FlexDateRangeCalendarConfig` | `auto` | `single`, `double`, or `auto` |
| `time` | `FlexTimeConfig` | `{}` | Start/end time drums |
| `showIcon` | `boolean` | `true` | Calendar icon |

### Time pickers

Roller/wheel UI with infinite loop scrolling. OK commits the value; Cancel reverts.

**`fdp-time-picker`** — `timeFormat`, `hourStep`, `minuteStep`, `secondStep`, `use24Hour`, `showSeconds`, `showIcon`.

**`fdp-time-range-picker`** — same inputs; value type `TimeRange` (`{ start, end }`).

### Month & year pickers

**Month:** `monthFormat` (default `'MMM yyyy'`), `min`, `max`, `showIcon`.

**Year:** `yearFormat` (default `'yyyy'`), `min`, `max`, `showIcon`.

Range variants share the same inputs and emit `rangeChange`.

## Shared configuration

### `FlexTimeConfig`

Used by date pickers via the `time` input:

```typescript
interface FlexTimeConfig {
  enabled?: boolean;       // default false
  format?: string;         // default 'HH:mm'
  minuteStep?: number;     // default 1
  hourStep?: number;       // default 1
  defaultTime?: { hours: number; minutes: number; seconds?: number };
  use24Hour?: boolean;     // default true
  showSeconds?: boolean;   // default false
}
```

### `FlexPresetSidebarConfig`

```typescript
interface FlexPresetSidebarConfig {
  enabled?: boolean;
  presets?: PresetRange[];
}

interface PresetRange {
  id: string;
  label: string;
  getRange: (referenceDate?: Date) => DateRange;
}
```

### `FlexDateRangeCalendarConfig`

```typescript
interface FlexDateRangeCalendarConfig {
  mode?: 'single' | 'double' | 'auto';  // default 'auto'
}
```

- `auto` — two months on desktop, one on mobile  
- `single` — always one calendar  
- `double` — always two consecutive months  

## Styling & theming

The library ships CSS custom properties in `flexible-date-picker-base.css`. Toggle dark mode:

```typescript
import { FlexThemeService } from 'ngx-flexible-date-picker';

constructor(private theme: FlexThemeService) {}

enableDarkMode() {
  this.theme.setDarkMode(true);
}
```

Common variables: `--flex-surface`, `--flex-primary`, `--flex-border`, `--flex-muted-foreground`, `--flex-range`, `--flex-radius`.

Apply `.dark` or `data-flex-theme="dark"` on `<html>` for the dark palette. Override any variable in your own CSS.

## Locale & RTL

```typescript
import { FlexLocaleService } from 'ngx-flexible-date-picker';

constructor(private locale: FlexLocaleService) {}

setFrench() {
  this.locale.setLocale('fr');
}

setArabic() {
  this.locale.setLocale('ar');
  document.documentElement.dir = 'rtl';
}
```

## Headless engines

Use selection logic without the DOM — ideal for custom UIs or unit tests:

```typescript
import { createDatePickerEngine } from 'ngx-flexible-date-picker';

const engine = createDatePickerEngine({ weekStartsOn: 1 });
engine.actions.open();
engine.actions.selectDate(new Date(2026, 4, 13));
console.log(engine.state.value);
```

Available factories: `createDatePickerEngine`, `createDateRangePickerEngine`, `createTimePickerEngine`, `createTimeRangePickerEngine`, `createMonthPickerEngine`, `createMonthRangePickerEngine`, `createYearPickerEngine`, `createYearRangePickerEngine`.

## Public API exports

**Components:** `FlexDatePickerComponent`, `FlexDateRangePickerComponent`, `FlexTimePickerComponent`, `FlexTimeRangePickerComponent`, `FlexMonthPickerComponent`, `FlexMonthRangePickerComponent`, `FlexYearPickerComponent`, `FlexYearRangePickerComponent`

**Types:** `DateRange`, `TimeRange`, `FlexTimeConfig`, `FlexPresetSidebarConfig`, `FlexDateRangeCalendarConfig`, `PresetRange`, `CalendarMonth`, `CalendarDay`, `Granularity`, `WeekStart`, `LocaleCode`

**Services:** `FlexThemeService`, `FlexLocaleService`, `FlexOverlayService`, `PickerEngineBridgeService`

**Utilities:** `normalizeDate`, `mergeDateAndTime`, `getTimeParts`, `generateHourOptions`, `generateMinuteOptions`, `getWeekdayLabels`, `buildLoopedOptions`

## Features

- Eight picker components — date, time, month, year (single and range)
- Headless engines for custom UI and testing
- Roller/wheel time selection with infinite loop scrolling
- Optional inline time on date and date-range pickers
- Preset shortcut sidebar for date ranges
- Min/max bounds, custom disabled dates, weekend blocking
- Light/dark theme via CSS variables
- Locale support and RTL layout
- Popover with focus trap, Escape to close, outside-click dismiss
- OnPush change detection and signal-based APIs
- Full `ControlValueAccessor` support for Angular forms

## Accessibility

- Trigger buttons: `aria-expanded`, `aria-haspopup="dialog"`
- Popover panels: `role="dialog"` with accessible names
- Calendar grids and time drums use semantic roles
- Keyboard: Escape closes; Tab trapped inside open dialogs

## Publishing (maintainers)

See [docs/PUBLISHING.md](../../docs/PUBLISHING.md) for the full build and npm publish process.

## Development

Clone the repository and run the playground:

```bash
npm install
npm start              # playground dev server
npm run build:lib      # build library
npm test               # unit tests
```

## License

See the repository for license information.
