import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CalendarYearGrid } from '../models';

@Component({
  selector: 'flex-year-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex-year-grid"
      role="grid"
      [attr.aria-label]="ariaLabel()"
      (mouseleave)="yearHover.emit(null)"
    >
      @for (cell of grid().years; track cell.year) {
        <button
          type="button"
          class="flex-year-cell"
          role="gridcell"
          [class.flex-year-cell--selected]="cell.isSelected"
          [class.flex-year-cell--in-range]="cell.isInRange"
          [class.flex-year-cell--range-start]="cell.isRangeStart"
          [class.flex-year-cell--range-end]="cell.isRangeEnd"
          [class.flex-year-cell--disabled]="cell.isDisabled"
          [class.flex-year-cell--today]="cell.isToday"
          [disabled]="cell.isDisabled"
          [attr.aria-selected]="cell.isSelected || cell.isRangeStart || cell.isRangeEnd"
          (click)="yearSelect.emit(cell.date)"
          (mouseenter)="yearHover.emit(cell.date)"
        >
          {{ cell.label }}
        </button>
      }
    </div>
  `,
})
export class FlexYearGridComponent {
  readonly grid = input.required<CalendarYearGrid>();
  readonly ariaLabel = input('Year picker');
  readonly yearSelect = output<Date>();
  readonly yearHover = output<Date | null>();
}
