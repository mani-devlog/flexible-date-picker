import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'flex-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-action-bar flex-action-bar--time">
      <button type="button" class="flex-btn flex-btn--text" (click)="cancelled.emit()">
        {{ cancelLabel() }}
      </button>
      <button
        type="button"
        class="flex-btn flex-btn--text flex-btn--primary"
        [disabled]="applyDisabled()"
        (click)="applied.emit()"
      >
        {{ applyLabel() }}
      </button>
    </div>
  `,
})
export class FlexActionBarComponent {
  readonly applyDisabled = input(false);
  readonly cancelLabel = input('Cancel');
  readonly applyLabel = input('Apply');
  readonly cancelled = output<void>();
  readonly applied = output<void>();
}
