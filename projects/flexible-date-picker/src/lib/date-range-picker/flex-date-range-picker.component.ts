import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  viewChild,
  DestroyRef,
  afterNextRender,
  effect,
  computed,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { format } from 'date-fns';
import type { DateRange, FlexDateRangeCalendarConfig, FlexPresetSidebarConfig, FlexTimeConfig, PresetRange } from '../models';
import { flexThemeTokensToStyle, type FlexThemeTokens } from '../themes/flex-theme-tokens';
import type { FlexColorScheme } from '../types';
import {
  createDateRangePickerEngine,
  type DateRangePickerEngine,
} from '../core/engines/date-range-picker.engine';
import { FlexLocaleService } from '../services/flex-locale.service';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { getWeekdayLabels } from '../utils/locale-utils';
import { FlexCalendarIconComponent } from '../shared/flex-calendar-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexCalendarGridComponent } from '../shared/flex-calendar-grid.component';
import { FlexNavHeaderComponent } from '../shared/flex-nav-header.component';
import { FlexPresetListComponent } from '../shared/flex-preset-list.component';
import { FlexActionBarComponent } from '../shared/flex-action-bar.component';
import { FlexTimeInputComponent } from '../shared/flex-time-input.component';

@Component({
  selector: 'fdp-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexDateRangePickerComponent),
      multi: true,
    },
  ],
  imports: [
    FlexPopoverComponent,
    FlexCalendarGridComponent,
    FlexNavHeaderComponent,
    FlexPresetListComponent,
    FlexActionBarComponent,
    FlexCalendarIconComponent,
    FlexTimeInputComponent,
  ],
  template: `
    <div
      #pickerWrapper
      class="flex-picker flex-picker-wrapper"
      [attr.data-flex-theme]="colorScheme() ?? null"
      [style]="pickerThemeStyles()"
    >
      <button
        #trigger
        type="button"
        class="flex-picker-trigger"
        [class.flex-picker-trigger--with-icon]="showIcon()"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="engine.state.isOpen"
        aria-haspopup="dialog"
        (click)="toggle()"
      >
        <span class="flex-picker-trigger__label">{{ displayValue }}</span>
        @if (showIcon()) {
          <flex-calendar-icon class="flex-picker-trigger__icon" />
        }
      </button>

      <flex-popover
        [open]="engine.state.isOpen"
        [anchor]="wrapperRef()"
        [panelClass]="popoverPanelClass"
        ariaLabel="Choose date range"
        (closed)="cancel()"
      >
        <div
          class="flex-range-layout"
          [class.flex-range-layout--no-presets]="!shouldShowPresetSidebar"
        >
          @if (shouldShowPresetSidebar) {
            <flex-preset-list
              [presets]="resolvedPresets"
              (presetSelect)="applyPreset($event)"
            />
          }

          <div class="flex-range-content">
            <div
              class="flex-dual-calendar"
              [class.flex-dual-calendar--single]="!shouldShowSecondCalendar"
            >
              <div class="flex-calendar-panel">
                <flex-nav-header
                  [label]="firstMonthLabel"
                  prevLabel="Previous month"
                  nextLabel="Next month"
                  (prev)="navigate('prev', 'first')"
                  (next)="navigate('next', 'first')"
                />
                <flex-calendar-grid
                  [month]="firstCalendarMonth"
                  [weekdayLabels]="weekdayLabels"
                  (daySelect)="selectDate($event)"
                  (dayHover)="setHover($event)"
                />
              </div>
              @if (shouldShowSecondCalendar) {
                <div class="flex-calendar-panel">
                  <flex-nav-header
                    [label]="secondMonthLabel"
                    prevLabel="Previous month"
                    nextLabel="Next month"
                    (prev)="navigate('prev', 'second')"
                    (next)="navigate('next', 'second')"
                  />
                  <flex-calendar-grid
                    [month]="secondCalendarMonth"
                    [weekdayLabels]="weekdayLabels"
                    (daySelect)="selectDate($event)"
                    (dayHover)="setHover($event)"
                  />
                </div>
              }
            </div>

            @if (isTimeEnabled()) {
              <div class="flex-time-panel flex-time-panel--range">
                <div class="flex-time-panel__range-inputs">
                  <flex-time-input
                    label="Start time"
                    [hours]="startTimeParts.hours"
                    [minutes]="startTimeParts.minutes"
                    [seconds]="startTimeParts.seconds"
                    [hourStep]="time().hourStep ?? 1"
                    [minuteStep]="time().minuteStep ?? 1"
                    [use24Hour]="time().use24Hour !== false"
                    [showSeconds]="time().showSeconds === true"
                    [disabled]="isDisabled()"
                    (timeChange)="setStartTime($event.hours, $event.minutes, $event.seconds)"
                  />
                  <flex-time-input
                    label="End time"
                    [hours]="endTimeParts.hours"
                    [minutes]="endTimeParts.minutes"
                    [seconds]="endTimeParts.seconds"
                    [hourStep]="time().hourStep ?? 1"
                    [minuteStep]="time().minuteStep ?? 1"
                    [use24Hour]="time().use24Hour !== false"
                    [showSeconds]="time().showSeconds === true"
                    [disabled]="isDisabled()"
                    (timeChange)="setEndTime($event.hours, $event.minutes, $event.seconds)"
                  />
                </div>
              </div>
            }

            <flex-action-bar
              [applyDisabled]="!engine.selectors.isRangeValid()"
              (cancelled)="cancel()"
              (applied)="apply()"
            />
          </div>
        </div>
      </flex-popover>
    </div>
  `,
})
export class FlexDateRangePickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select date range');
  readonly dateFormat = input('MMM d, yyyy');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly isDateDisabled = input<(date: Date) => boolean>();
  /** Configure the preset shortcut sidebar (visibility and items). */
  readonly presetSidebar = input<FlexPresetSidebarConfig>({});
  /** Configure single vs dual month calendars. */
  readonly calendarLayout = input<FlexDateRangeCalendarConfig>({ mode: 'auto' });
  /** Optional time-of-day selection for range endpoints. */
  readonly time = input<FlexTimeConfig>({});
  readonly disabled = input(false);
  readonly showIcon = input(true);
  /** When set, overrides the document theme for this picker only. */
  readonly colorScheme = input<FlexColorScheme>();
  /** Partial palette overrides applied as CSS variables on this picker. */
  readonly customColors = input<FlexThemeTokens>();
  readonly pickerThemeStyles = computed(() => flexThemeTokensToStyle(this.customColors()));
  readonly rangeChange = output<DateRange>();

  readonly overlay = inject(FlexOverlayService);
  private readonly locale = inject(FlexLocaleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: DateRange) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: DateRangePickerEngine = createDateRangePickerEngine({
    weekStartsOn: this.locale.weekStartsOn(),
  });

  get resolvedPresets(): PresetRange[] {
    const configured = this.presetSidebar().presets;
    if (configured !== undefined) {
      return configured;
    }
    return this.engine.selectors.getPresets();
  }

  get shouldShowPresetSidebar(): boolean {
    const { enabled } = this.presetSidebar();
    return enabled !== false && this.resolvedPresets.length > 0;
  }

  get shouldShowSecondCalendar(): boolean {
    const mode = this.calendarLayout().mode ?? 'auto';
    if (mode === 'single') {
      return false;
    }
    if (mode === 'double') {
      return true;
    }
    return !this.overlay.isMobile();
  }

  get popoverPanelClass(): string {
    return this.shouldShowSecondCalendar ? 'flex-popover--range' : 'flex-popover--range-single';
  }

  get firstCalendarMonth() {
    return this.engine.selectors.getFirstCalendarMonth();
  }

  get secondCalendarMonth() {
    return this.engine.selectors.getSecondCalendarMonth();
  }

  get firstMonthLabel(): string {
    return format(this.engine.state.visibleDate, 'MMMM yyyy');
  }

  get secondMonthLabel(): string {
    return format(this.engine.state.secondVisibleDate, 'MMMM yyyy');
  }

  get weekdayLabels(): string[] {
    return getWeekdayLabels(this.locale.weekStartsOn(), this.locale.localeCode());
  }

  get startTimeParts() {
    return this.engine.selectors.getStartTimeParts();
  }

  get endTimeParts() {
    return this.engine.selectors.getEndTimeParts();
  }

  isTimeEnabled(): boolean {
    return this.time().enabled === true;
  }

  displayFormat(): string {
    if (this.isTimeEnabled()) {
      return `${this.dateFormat()} ${this.time().format ?? 'HH:mm'}`;
    }
    return this.dateFormat();
  }

  get displayValue(): string {
    const formatPattern = this.displayFormat();
    const { start, end } = this.engine.state.value;
    if (!start && !end) {
      return this.placeholder();
    }
    if (start && !end) {
      return format(start, formatPattern);
    }
    if (start && end) {
      return `${format(start, formatPattern)} – ${format(end, formatPattern)}`;
    }
    return this.placeholder();
  }

  constructor() {
    effect(() => {
      const config = this.time();
      this.engine.actions.updateTimeOptions({
        enabled: config.enabled ?? false,
        defaultStartTime: {
          hours: config.defaultTime?.hours ?? 0,
          minutes: config.defaultTime?.minutes ?? 0,
          seconds: config.defaultTime?.seconds ?? 0,
        },
        defaultEndTime: { hours: 23, minutes: 59, seconds: 59 },
      });
      this.engine.actions.updateValidation({
        min: this.min(),
        max: this.max(),
        isDisabled: this.isDateDisabled(),
      });
    });

    afterNextRender(() => {
      const el = this.wrapperRef();
      if (!el) {
        return;
      }
      const cleanup = this.overlay.listenOutsideClick(el, () => {
        if (this.engine.state.isOpen && !this.overlay.isMobile()) {
          this.cancel();
        }
      });
      this.destroyRef.onDestroy(cleanup);
    });
  }

  writeValue(value: DateRange | null): void {
    this.engine.actions.setValue(value ?? { start: null, end: null });
    this.sync();
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled = isDisabled;
    this.sync();
  }

  isDisabled(): boolean {
    return this.disabled() || this.formDisabled;
  }

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.engine.actions.open();
    this.onTouched();
    this.sync();
  }

  cancel(): void {
    this.engine.actions.cancel();
    this.sync();
  }

  apply(): void {
    this.engine.actions.apply();
    this.onChange({ ...this.engine.state.value });
    this.rangeChange.emit({ ...this.engine.state.value });
    this.onTouched();
    this.sync();
  }

  navigate(direction: 'prev' | 'next', panel: 'first' | 'second'): void {
    this.engine.actions.navigate(direction, panel);
    this.sync();
  }

  selectDate(date: Date): void {
    this.engine.actions.selectDate(date);
    this.sync();
  }

  setStartTime(hours: number, minutes: number, seconds = 0): void {
    this.engine.actions.setStartTime(hours, minutes, seconds);
    this.sync();
  }

  setEndTime(hours: number, minutes: number, seconds = 0): void {
    this.engine.actions.setEndTime(hours, minutes, seconds);
    this.sync();
  }

  setHover(date: Date | null): void {
    const prev = this.engine.state.hoverDate?.getTime() ?? null;
    const next = date?.getTime() ?? null;
    if (prev === next) {
      return;
    }
    this.engine.actions.setHoverDate(date);
    this.sync();
  }

  applyPreset(preset: PresetRange): void {
    this.engine.actions.applyPreset(preset);
    this.sync();
  }

  private sync(): void {
    this.cdr.markForCheck();
  }
}
