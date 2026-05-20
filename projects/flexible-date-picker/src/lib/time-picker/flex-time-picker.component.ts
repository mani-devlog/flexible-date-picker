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
import {
  createTimePickerEngine,
  type TimePickerEngine,
} from '../core/engines/time-picker.engine';
import { FlexOverlayService } from '../services/flex-overlay.service';
import { FlexClockIconComponent } from '../shared/flex-clock-icon.component';
import { FlexPopoverComponent } from '../shared/flex-popover.component';
import { FlexTimeInputComponent } from '../shared/flex-time-input.component';
import { FlexActionBarComponent } from '../shared/flex-action-bar.component';

@Component({
  selector: 'fdp-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlexTimePickerComponent),
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
        (keydown)="onTriggerKeydown($event)"
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
        ariaLabel="Choose time"
        (closed)="cancel()"
      >
        <div class="flex-time-panel flex-time-panel--picker">
          <flex-time-input
            [hours]="engine.state.draftHours"
            [minutes]="engine.state.draftMinutes"
            [seconds]="engine.state.draftSeconds"
            [hourStep]="hourStep()"
            [minuteStep]="minuteStep()"
            [secondStep]="secondStep()"
            [use24Hour]="use24Hour()"
            [showSeconds]="showSeconds()"
            [disabled]="isDisabled()"
            (timeChange)="setDraftTime($event.hours, $event.minutes, $event.seconds)"
          />
          <flex-action-bar
            cancelLabel="CANCEL"
            applyLabel="OK"
            [applyDisabled]="false"
            (cancelled)="cancel()"
            (applied)="apply()"
          />
        </div>
      </flex-popover>
    </div>
  `,
})
export class FlexTimePickerComponent implements ControlValueAccessor {
  readonly placeholder = input('Select time');
  readonly timeFormat = input('HH:mm');
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly use24Hour = input(true);
  readonly showSeconds = input(false);
  readonly disabled = input(false);
  readonly showIcon = input(true);
  readonly timeChange = output<Date | null>();

  private readonly overlay = inject(FlexOverlayService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly wrapperRef = viewChild<ElementRef<HTMLElement>>('pickerWrapper');

  private formDisabled = false;
  private onChange: (value: Date | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly engine: TimePickerEngine = createTimePickerEngine();

  get displayValue(): string {
    const value = this.engine.state.value;
    return value ? format(value, this.timeFormat()) : this.placeholder();
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

  cancel(): void {
    this.engine.actions.cancel();
    this.sync();
  }

  apply(): void {
    this.engine.actions.apply();
    this.onChange(this.engine.state.value);
    this.timeChange.emit(this.engine.state.value);
    this.onTouched();
    this.sync();
  }

  setDraftTime(hours: number, minutes: number, seconds: number): void {
    const { draftHours, draftMinutes, draftSeconds } = this.engine.state;
    if (
      hours === draftHours &&
      minutes === draftMinutes &&
      seconds === draftSeconds
    ) {
      return;
    }
    this.engine.actions.setDraftTime(hours, minutes, seconds);
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
