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
import type { FlexTimeConfig } from '../models';
import { flexThemeTokensToStyle, type FlexThemeTokens } from '../themes/flex-theme-tokens';
import type { FlexColorScheme } from '../types';
import { createDatePickerEngine, type DatePickerEngine } from '../core/engines/date-picker.engine';
import { FlexLocaleService } from '../services/flex-locale.service';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { getWeekdayLabels } from '../utils/locale-utils';
import { FlexCalendarIconComponent } from '../shared/flex-calendar-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexCalendarGridComponent } from '../shared/flex-calendar-grid.component';
import { FlexNavHeaderComponent } from '../shared/flex-nav-header.component';
import { FlexTimeInputComponent } from '../shared/flex-time-input.component';

@Component({
  selector: 'fdp-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexDatePickerComponent),
      multi: true,
    },
  ],
  imports: [
    FlexPopoverComponent,
    FlexCalendarGridComponent,
    FlexNavHeaderComponent,
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
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="flex-picker-trigger__label">{{ displayValue }}</span>
        @if (showIcon()) {
          <flex-calendar-icon class="flex-picker-trigger__icon" />
        }
      </button>

      <flex-popover
        [open]="engine.state.isOpen"
        [anchor]="wrapperRef()"
        ariaLabel="Choose date"
        (closed)="close()"
      >
        <flex-nav-header
          [label]="monthLabel"
          prevLabel="Previous month"
          nextLabel="Next month"
          (prev)="navigate('prev')"
          (next)="navigate('next')"
        />
        <flex-calendar-grid
          [month]="calendarMonth"
          [weekdayLabels]="weekdayLabels"
          (daySelect)="selectDate($event)"
          (dayHover)="setHover($event)"
        />
        @if (isTimeEnabled()) {
          <div class="flex-time-panel flex-time-panel--inline">
            <flex-time-input
              label="Time"
              [hours]="timeParts.hours"
              [minutes]="timeParts.minutes"
              [seconds]="timeParts.seconds"
              [hourStep]="time().hourStep ?? 1"
              [minuteStep]="time().minuteStep ?? 1"
              [use24Hour]="time().use24Hour !== false"
              [showSeconds]="time().showSeconds === true"
              [disabled]="isDisabled()"
              (timeChange)="setTime($event.hours, $event.minutes, $event.seconds)"
            />
          </div>
        }
      </flex-popover>
    </div>
  `,
})
export class FlexDatePickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select date');
  readonly dateFormat = input('MMM d, yyyy');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly isDateDisabled = input<(date: Date) => boolean>();
  readonly time = input<FlexTimeConfig>({});
  readonly dateChange = output<Date | null>();
  readonly disabled = input(false);
  readonly showIcon = input(true);
  /** When set, overrides the document theme for this picker only. */
  readonly colorScheme = input<FlexColorScheme>();
  /** Partial palette overrides applied as CSS variables on this picker. */
  readonly customColors = input<FlexThemeTokens>();

  readonly pickerThemeStyles = computed(() => flexThemeTokensToStyle(this.customColors()));

  private readonly locale = inject(FlexLocaleService);
  private readonly overlay = inject(FlexOverlayService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: Date | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: DatePickerEngine = createDatePickerEngine({
    weekStartsOn: this.locale.weekStartsOn(),
  });

  get calendarMonth() {
    return this.engine.selectors.getCalendarMonth();
  }

  get timeParts() {
    const value = this.engine.state.value;
    if (value) {
      return {
        hours: value.getHours(),
        minutes: value.getMinutes(),
        seconds: value.getSeconds(),
      };
    }
    return {
      hours: this.time().defaultTime?.hours ?? 0,
      minutes: this.time().defaultTime?.minutes ?? 0,
      seconds: this.time().defaultTime?.seconds ?? 0,
    };
  }

  get displayValue(): string {
    const value = this.engine.state.value;
    return value ? format(value, this.displayFormat()) : this.placeholder();
  }

  get monthLabel(): string {
    return format(this.engine.state.visibleDate, 'MMMM yyyy');
  }

  get weekdayLabels(): string[] {
    return getWeekdayLabels(this.locale.weekStartsOn(), this.locale.localeCode());
  }

  constructor() {
    effect(() => {
      const config = this.time();
      this.engine.actions.updateTimeOptions({
        enabled: config.enabled ?? false,
        defaultTime: {
          hours: config.defaultTime?.hours ?? 0,
          minutes: config.defaultTime?.minutes ?? 0,
          seconds: config.defaultTime?.seconds ?? 0,
        },
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
          this.close();
        }
      });
      this.destroyRef.onDestroy(cleanup);
    });
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

  writeValue(value: Date | null): void {
    this.engine.actions.setValue(value);
    this.sync();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
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
    this.engine.actions.toggle();
    this.onTouched();
    this.sync();
  }

  close(): void {
    this.engine.actions.close();
    this.sync();
  }

  navigate(direction: 'prev' | 'next'): void {
    this.engine.actions.navigate(direction);
    this.sync();
  }

  selectDate(date: Date): void {
    this.engine.actions.selectDate(date);
    this.emitValue();
    this.sync();
  }

  setTime(hours: number, minutes: number, seconds = 0): void {
    this.engine.actions.setTime(hours, minutes, seconds);
    this.emitValue();
    this.sync();
  }

  setHover(date: Date | null): void {
    this.engine.actions.setHoverDate(date);
    this.sync();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.engine.actions.open();
      this.sync();
    }
  }

  private emitValue(): void {
    this.onChange(this.engine.state.value);
    this.dateChange.emit(this.engine.state.value);
    this.onTouched();
  }

  private sync(): void {
    this.cdr.markForCheck();
  }
}
