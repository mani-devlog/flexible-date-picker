# @manidev/ngx-flexible-date-picker

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
npm install @manidev/ngx-flexible-date-picker date-fns
```

Import the stylesheet in your global styles (required):

```css
@import '@manidev/ngx-flexible-date-picker/themes/flexible-date-picker.css';
```

## Quick start

Import a picker as a standalone component and bind it with reactive forms:

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlexDatePickerComponent } from '@manidev/ngx-flexible-date-picker';

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
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | — | Per-picker theme; inherits document when omitted |
| `customColors` | `FlexThemeTokens` | — | Partial palette overrides as CSS variables |

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

All pickers also accept optional `colorScheme` (`'light' | 'dark' | 'auto'`) and `customColors` (`FlexThemeTokens`) to override the document theme for that instance only.

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

The library ships CSS custom properties in `flexible-date-picker-base.css`.

### Global theme

```typescript
import { FlexThemeService } from '@manidev/ngx-flexible-date-picker';

constructor(private theme: FlexThemeService) {}

enableDarkMode() {
  this.theme.setDarkMode(true);
}

useSystemTheme() {
  this.theme.setColorScheme('auto');
}
```

`FlexThemeService` supports `setColorScheme('light' | 'dark' | 'auto')`, `setDarkMode()`, `toggleDarkMode()`, `getColorScheme()`, and `isDarkMode()`.

### Per-picker color scheme

Every picker accepts an optional `colorScheme` input (`'light' | 'dark' | 'auto'`). When set, the picker applies `data-flex-theme` on its root so it can differ from the document theme:

```html
<fdp-date-picker colorScheme="dark" placeholder="Select date" />
<fdp-date-range-picker colorScheme="auto" />
```

Omit `colorScheme` to inherit the global palette from `<html>`.

### Custom colors

Pass a partial `FlexThemeTokens` object to override specific CSS variables. Works alone or combined with `colorScheme` (custom values win on the properties you set):

```html
<fdp-date-picker
  colorScheme="light"
  [customColors]="{
    primary: '#be123c',
    primaryForeground: '#ffffff',
    range: '#fecdd3',
    radius: '0.5rem'
  }"
/>
```

```typescript
this.theme.setColorScheme('light');
this.theme.applyCustomColors({ primary: '#7c3aed', surface: '#faf5ff' });
// this.theme.clearCustomColors();
```

`FlexThemeTokens` fields: `surface`, `surfaceElevated`, `border`, `primary`, `primaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `range`, `today`, `disabled`, `radius`, `shadow`.

Common variables: `--flex-surface`, `--flex-primary`, `--flex-border`, `--flex-muted-foreground`, `--flex-range`, `--flex-radius`. Override any variable in your own CSS as well.

## Locale & RTL

```typescript
import { FlexLocaleService } from '@manidev/ngx-flexible-date-picker';

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
import { createDatePickerEngine } from '@manidev/ngx-flexible-date-picker';

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

## License

See the repository for license information.
