import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'flex-nav-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-nav-header">
      <button
        type="button"
        class="flex-nav-button"
        [attr.aria-label]="prevLabel()"
        (click)="prev.emit()"
      >
        ‹
      </button>
      <span class="font-semibold text-sm" aria-live="polite">{{ label() }}</span>
      <button
        type="button"
        class="flex-nav-button"
        [attr.aria-label]="nextLabel()"
        (click)="next.emit()"
      >
        ›
      </button>
    </div>
  `,
})
export class FlexNavHeaderComponent {
  readonly label = input('');
  readonly prevLabel = input('Previous');
  readonly nextLabel = input('Next');
  readonly prev = output<void>();
  readonly next = output<void>();
}
