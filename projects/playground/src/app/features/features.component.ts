import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../shared/code-block/code-block.component';
import { docsSnippets } from '../docs/docs-snippets';

interface FeatureCard {
  title: string;
  description: string;
  icon: 'calendar' | 'clock' | 'range' | 'engine' | 'theme' | 'forms' | 'a11y' | 'locale';
}

interface PickerHighlight {
  name: string;
  selector: string;
  description: string;
}

@Component({
  selector: 'app-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {
  readonly importSnippet = docsSnippets.featuresImport;
  readonly featureCards: FeatureCard[] = [
    {
      title: 'Eight picker components',
      description:
        'Date, date range, time, time range, month, month range, year, and year range — each as a standalone Angular component with consistent UX.',
      icon: 'calendar',
    },
    {
      title: 'Roller time wheels',
      description:
        'Native-feeling scroll wheels for hours, minutes, and seconds with infinite loop scrolling and compact 3-row layout.',
      icon: 'clock',
    },
    {
      title: 'Range selection',
      description:
        'Dual calendars, preset shortcuts, hover preview, and side-by-side start/end time pickers for complete range workflows.',
      icon: 'range',
    },
    {
      title: 'Headless engines',
      description:
        'Pure TypeScript selection engines power every picker. Use them for custom UI or testable selection logic without the DOM.',
      icon: 'engine',
    },
    {
      title: 'Theming & custom colors',
      description:
        'Light, dark, and auto color schemes per picker or globally. Override any design token with FlexThemeTokens for full brand control.',
      icon: 'theme',
    },
    {
      title: 'Forms-ready',
      description:
        'Every picker implements ControlValueAccessor for reactive forms and template-driven ngModel out of the box.',
      icon: 'forms',
    },
    {
      title: 'Accessible by default',
      description:
        'Dialog roles, focus traps, keyboard navigation, ARIA labels on triggers and scroll columns, and escape to dismiss.',
      icon: 'a11y',
    },
    {
      title: 'Locale & RTL',
      description:
        'Localized weekday labels and calendar layout via FlexLocaleService. Full RTL support for Arabic and other right-to-left locales.',
      icon: 'locale',
    },
  ];

  readonly pickerHighlights: PickerHighlight[] = [
    {
      name: 'Date picker',
      selector: 'fdp-date-picker',
      description: 'Single-day calendar with optional inline time drum, min/max, and disabled dates.',
    },
    {
      name: 'Date range picker',
      selector: 'fdp-date-range-picker',
      description: 'Preset sidebar, responsive dual calendars, and optional start/end times.',
    },
    {
      name: 'Time picker',
      selector: 'fdp-time-picker',
      description: 'Standalone roller wheel for time with 12h/24h, seconds, and step intervals.',
    },
    {
      name: 'Time range picker',
      selector: 'fdp-time-range-picker',
      description: 'Parallel start and end time columns with OK/Cancel confirmation.',
    },
    {
      name: 'Month picker',
      selector: 'fdp-month-picker',
      description: '12-month grid for selecting a single month and year.',
    },
    {
      name: 'Month range picker',
      selector: 'fdp-month-range-picker',
      description: 'Select a contiguous range of months across years.',
    },
    {
      name: 'Year picker',
      selector: 'fdp-year-picker',
      description: 'Scrollable year grid with decade navigation.',
    },
    {
      name: 'Year range picker',
      selector: 'fdp-year-range-picker',
      description: 'Pick a span of years for long-term filters and reporting.',
    },
  ];

  readonly highlights = [
    'Built on Angular 20+ signals and OnPush change detection',
    'date-fns for formatting, parsing, and calendar math',
    'Popover overlay with smart above/below placement',
    'Mobile-friendly bottom sheet on small viewports',
    'Configurable placeholders, formats, and calendar icons',
    'Weekend blocking and custom isDateDisabled callbacks',
    'Typed configuration models for time, presets, and calendar layout',
  ];
}
