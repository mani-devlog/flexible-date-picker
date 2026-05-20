import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
  inject,
  effect,
  signal,
} from '@angular/core';
import { FlexOverlayService } from '../services/flex-overlay.service';

@Component({
  selector: 'flex-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-popover-host',
  },
  template: `
    @if (open()) {
      @if (overlay.isMobile()) {
        <div class="flex-backdrop" (click)="closed.emit()" aria-hidden="true"></div>
      }
      <div
        #panel
        class="flex-popover"
        [class.flex-popover--range]="panelClass() === 'flex-popover--range'"
        [class.flex-popover--range-single]="panelClass() === 'flex-popover--range-single'"
        [class.flex-popover--single-range]="panelClass() === 'flex-popover--single-range'"
        [class.flex-popover-desktop]="!overlay.isMobile()"
        [class.flex-popover-desktop--above]="!overlay.isMobile() && placement() === 'above'"
        [class.flex-popover-mobile]="overlay.isMobile()"
        role="dialog"
        [attr.aria-label]="ariaLabel()"
        (click)="$event.stopPropagation()"
      >
        <ng-content />
      </div>
    }
  `,
})
export class FlexPopoverComponent {
  readonly open = input(false);
  readonly ariaLabel = input('Date picker');
  readonly panelClass = input('');
  readonly anchor = input<ElementRef<HTMLElement>>();
  readonly closed = output<void>();

  readonly overlay = inject(FlexOverlayService);
  readonly placement = signal<'below' | 'above'>('below');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect((onCleanup) => {
      const isOpen = this.open();
      const panel = this.panel();
      const anchor = this.anchor();

      if (!isOpen || !panel) {
        this.placement.set('below');
        return;
      }

      const cleanupFns = [
        this.overlay.trapFocus(panel.nativeElement),
        this.overlay.listenEscape(() => this.closed.emit()),
      ];

      const anchorEl = anchor?.nativeElement;
      if (anchorEl && !this.overlay.isMobile()) {
        cleanupFns.push(
          this.overlay.alignOverlay(anchorEl, panel.nativeElement, (next) => this.placement.set(next)),
        );
      } else {
        this.placement.set('below');
      }

      onCleanup(() => cleanupFns.forEach((fn) => fn()));
    });
  }
}
