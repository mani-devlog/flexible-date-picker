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
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { format } from 'date-fns';
import type { TimeRange } from '../models';
import {
  createTimeRangePickerEngine,
  type TimeRangePickerEngine,
} from '../core/engines/time-picker.engine';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { FlexClockIconComponent } from '../shared/flex-clock-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexTimeInputComponent } from '../shared/flex-time-input.component';
import { FlexActionBarComponent } from '../shared/flex-action-bar.component';

@Component({
  selector: 'fdp-time-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexTimeRangePickerComponent),
      multi: true,
    },
  ],
  imports: [
    FlexPopoverComponent,
    FlexTimeInputComponent,
    FlexActionBarComponent,
    FlexClockIconComponent,
  ],
  template: `
    <div #pickerWrapper class="flex-picker flex-picker-wrapper">
      <button
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
          <flex-clock-icon class="flex-picker-trigger__icon" />
        }
      </button>

      <flex-popover
        [open]="engine.state.isOpen"
        [anchor]="wrapperRef()"
        [panelClass]="'flex-popover--time'"
        ariaLabel="Choose time range"
        (closed)="cancel()"
      >
        <div class="flex-time-panel flex-time-panel--picker flex-time-panel--range">
          <div class="flex-time-panel__range-inputs">
            <flex-time-input
              label="Start"
              [hours]="engine.state.draftStartHours"
              [minutes]="engine.state.draftStartMinutes"
              [seconds]="engine.state.draftStartSeconds"
              [hourStep]="hourStep()"
              [minuteStep]="minuteStep()"
              [secondStep]="secondStep()"
              [use24Hour]="use24Hour()"
              [showSeconds]="showSeconds()"
              [disabled]="isDisabled()"
              (timeChange)="setDraftStart($event.hours, $event.minutes, $event.seconds)"
            />
            <flex-time-input
              label="End"
              [hours]="engine.state.draftEndHours"
              [minutes]="engine.state.draftEndMinutes"
              [seconds]="engine.state.draftEndSeconds"
              [hourStep]="hourStep()"
              [minuteStep]="minuteStep()"
              [secondStep]="secondStep()"
              [use24Hour]="use24Hour()"
              [showSeconds]="showSeconds()"
              [disabled]="isDisabled()"
              (timeChange)="setDraftEnd($event.hours, $event.minutes, $event.seconds)"
            />
          </div>
          <flex-action-bar
            cancelLabel="CANCEL"
            applyLabel="OK"
            [applyDisabled]="!engine.selectors.isRangeValid()"
            (cancelled)="cancel()"
            (applied)="apply()"
          />
        </div>
      </flex-popover>
    </div>
  `,
})
export class FlexTimeRangePickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select time range');
  readonly timeFormat = input('HH:mm');
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly use24Hour = input(true);
  readonly showSeconds = input(false);
  readonly disabled = input(false);
  readonly showIcon = input(true);
  readonly rangeChange = output<TimeRange>();

  private readonly overlay = inject(FlexOverlayService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: TimeRange) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: TimeRangePickerEngine = createTimeRangePickerEngine();

  get displayValue(): string {
    const { start, end } = this.engine.state.value;
    if (!start && !end) {
      return this.placeholder();
    }
    if (start && end) {
      return `${format(start, this.timeFormat())} – ${format(end, this.timeFormat())}`;
    }
    if (start) {
      return format(start, this.timeFormat());
    }
    return this.placeholder();
  }

  constructor() {
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

  writeValue(value: TimeRange | null): void {
    this.engine.actions.setValue(value ?? { start: null, end: null });
    this.sync();
  }

  registerOnChange(fn: (value: TimeRange) => void): void {
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

  setDraftStart(hours: number, minutes: number, seconds: number): void {
    const { draftStartHours, draftStartMinutes, draftStartSeconds } = this.engine.state;
    if (
      hours === draftStartHours &&
      minutes === draftStartMinutes &&
      seconds === draftStartSeconds
    ) {
      return;
    }
    this.engine.actions.setDraftStart(hours, minutes, seconds);
    this.sync();
  }

  setDraftEnd(hours: number, minutes: number, seconds: number): void {
    const { draftEndHours, draftEndMinutes, draftEndSeconds } = this.engine.state;
    if (
      hours === draftEndHours &&
      minutes === draftEndMinutes &&
      seconds === draftEndSeconds
    ) {
      return;
    }
    this.engine.actions.setDraftEnd(hours, minutes, seconds);
    this.sync();
  }

  private sync(): void {
    this.cdr.markForCheck();
  }
}
