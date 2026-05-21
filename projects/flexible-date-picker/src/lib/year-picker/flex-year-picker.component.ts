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
import {
  createYearPickerEngine,
  type YearPickerEngine,
} from '../core/engines/year-picker.engine';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { FlexCalendarIconComponent } from '../shared/flex-calendar-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexYearGridComponent } from '../shared/flex-year-grid.component';
import { FlexNavHeaderComponent } from '../shared/flex-nav-header.component';
import { flexThemeTokensToStyle, type FlexThemeTokens } from '../themes/flex-theme-tokens';
import type { FlexColorScheme } from '../types';

@Component({
  selector: 'fdp-year-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexYearPickerComponent),
      multi: true,
    },
  ],
  imports: [FlexPopoverComponent, FlexYearGridComponent, FlexNavHeaderComponent, FlexCalendarIconComponent],
  template: `
    <div
      #pickerWrapper
      class="flex-picker flex-picker-wrapper"
      [attr.data-flex-theme]="colorScheme() ?? null"
      [style]="pickerThemeStyles()"
    >
      <button
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
        ariaLabel="Choose year"
        (closed)="close()"
      >
        <flex-nav-header
          [label]="pageLabel"
          prevLabel="Previous years"
          nextLabel="Next years"
          (prev)="navigate('prev')"
          (next)="navigate('next')"
        />
        <flex-year-grid
          [grid]="yearGrid"
          (yearSelect)="selectYear($event)"
          (yearHover)="setHover($event)"
        />
      </flex-popover>
    </div>
  `,
})
export class FlexYearPickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select year');
  readonly yearFormat = input('yyyy');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly disabled = input(false);
  readonly showIcon = input(true);
  /** When set, overrides the document theme for this picker only. */
  readonly colorScheme = input<FlexColorScheme>();
  /** Partial palette overrides applied as CSS variables on this picker. */
  readonly customColors = input<FlexThemeTokens>();
  readonly pickerThemeStyles = computed(() => flexThemeTokensToStyle(this.customColors()));
  readonly yearChange = output<Date | null>();

  private readonly overlay = inject(FlexOverlayService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: Date | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: YearPickerEngine = createYearPickerEngine({
    validation: { granularity: 'year' },
  });

  get yearGrid() {
    return this.engine.selectors.getYearGrid();
  }

  get pageLabel(): string {
    const grid = this.yearGrid;
    return `${grid.startYear} – ${grid.endYear}`;
  }

  get displayValue(): string {
    const value = this.engine.state.value;
    return value ? format(value, this.yearFormat()) : this.placeholder();
  }

  constructor() {
    effect(() => {
      this.engine.actions.updateValidation({
        min: this.min(),
        max: this.max(),
        granularity: 'year',
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
          this.close();
        }
      });
      this.destroyRef.onDestroy(cleanup);
    });
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

  selectYear(date: Date): void {
    this.engine.actions.selectYear(date);
    this.onChange(this.engine.state.value);
    this.yearChange.emit(this.engine.state.value);
    this.onTouched();
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

  private sync(): void {
    this.cdr.markForCheck();
  }
}
