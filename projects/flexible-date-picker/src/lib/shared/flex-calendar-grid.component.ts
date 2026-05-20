import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CalendarMonth } from '../models';

@Component({
  selector: 'flex-calendar-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex-calendar-grid"
      role="grid"
      [attr.aria-label]="ariaLabel()"
      (mouseleave)="dayHover.emit(null)"
    >
      <div class="flex-calendar-matrix">
        @for (label of weekdayLabels(); track $index) {
          <div class="flex-weekday" role="columnheader">{{ label }}</div>
        }
        @for (week of month().weeks; track $index) {
          @for (day of week.days; track day.date.getTime()) {
            <button
              type="button"
              class="flex-day"
              role="gridcell"
              [class.flex-day--outside]="!day.isCurrentMonth"
              [class.flex-day--today]="day.isToday"
              [class.flex-day--selected]="day.isSelected"
              [class.flex-day--in-range]="day.isInRange"
              [class.flex-day--range-start]="day.isRangeStart"
              [class.flex-day--range-end]="day.isRangeEnd"
              [class.flex-day--disabled]="day.isDisabled"
              [disabled]="day.isDisabled"
              [attr.aria-selected]="day.isSelected || day.isRangeStart || day.isRangeEnd"
              [attr.aria-disabled]="day.isDisabled"
              [attr.tabindex]="day.isFocused ? 0 : -1"
              (click)="daySelect.emit(day.date)"
              (mouseenter)="dayHover.emit(day.date)"
            >
              {{ day.date.getDate() }}
            </button>
          }
        }
      </div>
    </div>
  `,
})
export class FlexCalendarGridComponent {
  readonly month = input.required<CalendarMonth>();
  readonly weekdayLabels = input<string[]>([]);
  readonly ariaLabel = input('Calendar');
  readonly daySelect = output<Date>();
  readonly dayHover = output<Date | null>();
}
