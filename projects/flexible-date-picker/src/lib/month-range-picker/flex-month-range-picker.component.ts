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
import type { DateRange } from '../models';
import { flexThemeTokensToStyle, type FlexThemeTokens } from '../themes/flex-theme-tokens';
import type { FlexColorScheme } from '../types';
import {
  createMonthRangePickerEngine,
  type MonthRangePickerEngine,
} from '../core/engines/month-range-picker.engine';
import { FlexLocaleService } from '../services/flex-locale.service';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { FlexCalendarIconComponent } from '../shared/flex-calendar-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexMonthGridComponent } from '../shared/flex-month-grid.component';
import { FlexNavHeaderComponent } from '../shared/flex-nav-header.component';
import { FlexActionBarComponent } from '../shared/flex-action-bar.component';

@Component({
  selector: 'fdp-month-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexMonthRangePickerComponent),
      multi: true,
    },
  ],
  imports: [
    FlexPopoverComponent,
    FlexMonthGridComponent,
    FlexNavHeaderComponent,
    FlexActionBarComponent,
    FlexCalendarIconComponent,
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
        [panelClass]="'flex-popover--single-range'"
        ariaLabel="Choose month range"
        (closed)="cancel()"
      >
        <div class="flex-range-content">
          <div class="flex-calendar-panel">
            <flex-nav-header
              [label]="yearLabel"
              prevLabel="Previous year"
              nextLabel="Next year"
              (prev)="navigate('prev')"
              (next)="navigate('next')"
            />
            <flex-month-grid
              [grid]="monthGrid"
              (monthSelect)="selectMonth($event)"
              (monthHover)="setHover($event)"
            />
          </div>

          <flex-action-bar
            [applyDisabled]="!engine.selectors.isRangeValid()"
            (cancelled)="cancel()"
            (applied)="apply()"
          />
        </div>
      </flex-popover>
    </div>
  `,
})
export class FlexMonthRangePickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select month range');
  readonly monthFormat = input('MMM yyyy');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly disabled = input(false);
  readonly showIcon = input(true);
  /** When set, overrides the document theme for this picker only. */
  readonly colorScheme = input<FlexColorScheme>();
  /** Partial palette overrides applied as CSS variables on this picker. */
  readonly customColors = input<FlexThemeTokens>();
  readonly pickerThemeStyles = computed(() => flexThemeTokensToStyle(this.customColors()));
  readonly rangeChange = output<DateRange>();

  private readonly locale = inject(FlexLocaleService);
  readonly overlay = inject(FlexOverlayService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: DateRange) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: MonthRangePickerEngine = createMonthRangePickerEngine({
    localeCode: this.locale.localeCode(),
    validation: { granularity: 'month' },
  });

  get monthGrid() {
    return this.engine.selectors.getMonthGrid();
  }

  get yearLabel(): string {
    return String(this.engine.state.visibleYear);
  }

  get displayValue(): string {
    const { start, end } = this.engine.state.value;
    if (!start && !end) {
      return this.placeholder();
    }
    if (start && end) {
      return `${format(start, this.monthFormat())} – ${format(end, this.monthFormat())}`;
    }
    if (start) {
      return format(start, this.monthFormat());
    }
    return this.placeholder();
  }

  constructor() {
    effect(() => {
      this.engine.actions.updateValidation({
        min: this.min(),
        max: this.max(),
        granularity: 'month',
      });
      this.sync();
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

  navigate(direction: 'prev' | 'next'): void {
    this.engine.actions.navigate(direction);
    this.sync();
  }

  selectMonth(date: Date): void {
    this.engine.actions.selectMonth(date);
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

  private sync(): void {
    this.cdr.markForCheck();
  }
}
