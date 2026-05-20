import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CalendarMonthGrid } from '../models';

@Component({
  selector: 'flex-month-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex-month-grid"
      role="grid"
      [attr.aria-label]="ariaLabel()"
      (mouseleave)="monthHover.emit(null)"
    >
      @for (cell of grid().months; track cell.month) {
        <button
          type="button"
          class="flex-month-cell"
          role="gridcell"
          [class.flex-month-cell--selected]="cell.isSelected"
          [class.flex-month-cell--in-range]="cell.isInRange"
          [class.flex-month-cell--range-start]="cell.isRangeStart"
          [class.flex-month-cell--range-end]="cell.isRangeEnd"
          [class.flex-month-cell--disabled]="cell.isDisabled"
          [disabled]="cell.isDisabled"
          [attr.aria-selected]="cell.isSelected || cell.isRangeStart || cell.isRangeEnd"
          (click)="monthSelect.emit(cell.date)"
          (mouseenter)="monthHover.emit(cell.date)"
        >
          {{ cell.label }}
        </button>
      }
    </div>
  `,
})
export class FlexMonthGridComponent {
  readonly grid = input.required<CalendarMonthGrid>();
  readonly ariaLabel = input('Month picker');
  readonly monthSelect = output<Date>();
  readonly monthHover = output<Date | null>();
}
