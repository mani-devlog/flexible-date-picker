import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  generateHourOptions,
  generateMinuteOptions,
  generateSecondOptions,
  to12HourParts,
  to24HourParts,
} from '../utils/time-utils';
import { FlexTimeDrumColumnComponent } from './flex-time-drum-column.component';

@Component({
  selector: 'flex-time-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-time-input',
    '[class.flex-time-input--disabled]': 'disabled()',
  },
  imports: [FlexTimeDrumColumnComponent],
  template: `
      @if (label()) {
        <span class="flex-time-input__label">{{ label() }}</span>
      }
      <div class="flex-time-drum">
        <div class="flex-time-drum__columns">
          <flex-time-drum-column
            ariaLabel="Hour"
            [loop]="true"
            [padValues]="use24Hour()"
            [options]="hourOptions()"
            [selected]="displayHour()"
            (selectedChange)="onHourSelected($event)"
          />
          <flex-time-drum-column
            ariaLabel="Minute"
            [loop]="true"
            [options]="minuteOptions()"
            [selected]="minutes()"
            (selectedChange)="onMinuteSelected($event)"
          />
          @if (showSeconds()) {
            <flex-time-drum-column
              ariaLabel="Second"
              [loop]="true"
              [options]="secondOptions()"
              [selected]="seconds()"
              (selectedChange)="onSecondSelected($event)"
            />
          }
          @if (!use24Hour()) {
            <flex-time-drum-column
              ariaLabel="Period"
              [padValues]="false"
              [options]="periodOptionsList"
              [selected]="period()"
              (selectedChange)="onPeriodSelected($event)"
            />
          }
        </div>
      </div>
  `,
})
export class FlexTimeInputComponent {
  readonly hours = input(0);
  readonly minutes = input(0);
  readonly seconds = input(0);
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly use24Hour = input(true);
  readonly showSeconds = input(false);
  readonly label = input('');
  readonly disabled = input(false);
  readonly timeChange = output<{ hours: number; minutes: number; seconds: number }>();

  readonly periodOptionsList: Array<'AM' | 'PM'> = ['AM', 'PM'];

  readonly hourOptions = computed(() =>
    generateHourOptions(this.hourStep(), this.use24Hour()),
  );

  readonly minuteOptions = computed(() => generateMinuteOptions(this.minuteStep()));

  readonly secondOptions = computed(() => generateSecondOptions(this.secondStep()));

  readonly displayHour = computed(() => {
    if (this.use24Hour()) {
      return this.hours();
    }
    return to12HourParts(this.hours()).hour12;
  });

  readonly period = computed(() => to12HourParts(this.hours()).period);

  onHourSelected(value: number | string): void {
    const hour = Number(value);
    const hours24 = this.use24Hour() ? hour : to24HourParts(hour, this.period());
    this.emitTime(hours24, this.minutes(), this.seconds());
  }

  onMinuteSelected(value: number | string): void {
    this.emitTime(this.hours(), Number(value), this.seconds());
  }

  onSecondSelected(value: number | string): void {
    this.emitTime(this.hours(), this.minutes(), Number(value));
  }

  onPeriodSelected(value: number | string): void {
    const period = value as 'AM' | 'PM';
    const hours24 = to24HourParts(this.displayHour(), period);
    this.emitTime(hours24, this.minutes(), this.seconds());
  }

  private emitTime(hours: number, minutes: number, seconds: number): void {
    this.timeChange.emit({ hours, minutes, seconds });
  }
}
