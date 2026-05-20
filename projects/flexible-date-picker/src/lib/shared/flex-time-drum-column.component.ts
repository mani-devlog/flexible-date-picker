import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  buildLoopedOptions,
  getLoopedOptionIndex,
  getLoopedScrollIndex,
  normalizeLoopedScrollIndex,
  padTimeUnit,
  shouldNormalizeLoopedScroll,
} from '../utils/time-utils';

export const TIME_DRUM_ITEM_HEIGHT = 36;
export const TIME_DRUM_VISIBLE_ROWS = 3;
export const TIME_DRUM_PADDING_ROWS = (TIME_DRUM_VISIBLE_ROWS - 1) / 2;

@Component({
  selector: 'flex-time-drum-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-time-drum-column',
    '[style.--flex-time-drum-item-height.px]': 'drumItemHeight',
    '[style.--flex-time-drum-visible-rows]': 'drumVisibleRows',
    '[style.--flex-time-drum-padding-rows]': 'drumPaddingRows',
  },
  template: `
      <div
        #viewport
        class="flex-time-drum-column__viewport"
        role="listbox"
        [attr.aria-label]="ariaLabel()"
        (scroll)="onScroll()"
        (wheel)="$event.stopPropagation()"
      >
        <div class="flex-time-drum-column__spacer" aria-hidden="true"></div>
        @for (option of renderedOptions(); track $index) {
          <button
            type="button"
            class="flex-time-drum-column__item"
            [class.flex-time-drum-column__item--selected]="option === selected()"
            (click)="selectOption(option)"
          >
            {{ formatOption(option) }}
          </button>
        }
        <div class="flex-time-drum-column__spacer" aria-hidden="true"></div>
      </div>
  `,
})
export class FlexTimeDrumColumnComponent {
  readonly options = input.required<(number | string)[]>();
  readonly selected = input.required<number | string>();
  readonly ariaLabel = input('');
  readonly padValues = input(true);
  readonly loop = input(false);
  readonly selectedChange = output<number | string>();

  protected readonly drumItemHeight = TIME_DRUM_ITEM_HEIGHT;
  protected readonly drumVisibleRows = TIME_DRUM_VISIBLE_ROWS;
  protected readonly drumPaddingRows = TIME_DRUM_PADDING_ROWS;

  readonly renderedOptions = computed(() => {
    const options = this.options();
    return this.loop() ? buildLoopedOptions(options) : options;
  });

  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly platformId = inject(PLATFORM_ID);
  private viewReady = false;
  private syncedSelected: number | string | null = null;
  private lastOptionsLength = 0;
  private scrollFrame: number | null = null;
  private syncingScroll = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.viewReady = true;
      this.syncedSelected = this.selected();
      this.syncScrollPosition(false);
    });

    effect(() => {
      const selected = this.selected();
      const optionsLength = this.options().length;
      if (!this.viewReady || !isPlatformBrowser(this.platformId)) {
        return;
      }

      const selectionChanged = selected !== this.syncedSelected;
      const optionsChanged = optionsLength !== this.lastOptionsLength;
      if (!selectionChanged && !optionsChanged) {
        return;
      }

      this.syncedSelected = selected;
      this.lastOptionsLength = optionsLength;
      requestAnimationFrame(() => this.syncScrollPosition(false));
    });
  }

  formatOption(option: number | string): string {
    if (typeof option === 'string') {
      return option;
    }
    return this.padValues() ? padTimeUnit(option) : String(option);
  }

  selectOption(option: number | string): void {
    if (option === this.selected()) {
      return;
    }
    this.syncedSelected = option;
    this.selectedChange.emit(option);
    this.syncScrollPosition(true);
  }

  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.syncingScroll) {
      return;
    }
    if (this.scrollFrame !== null) {
      cancelAnimationFrame(this.scrollFrame);
    }
    this.scrollFrame = requestAnimationFrame(() => {
      const viewport = this.viewportRef()?.nativeElement;
      if (!viewport) {
        return;
      }

      const options = this.options();
      let rawIndex = Math.round(viewport.scrollTop / TIME_DRUM_ITEM_HEIGHT);

      if (this.loop() && shouldNormalizeLoopedScroll(rawIndex, options.length)) {
        rawIndex = normalizeLoopedScrollIndex(rawIndex, options.length);
        this.setScrollTop(viewport, rawIndex * TIME_DRUM_ITEM_HEIGHT, false);
      }

      const option = this.resolveOption(rawIndex, options);
      if (option !== undefined && option !== this.selected()) {
        this.syncedSelected = option;
        this.selectedChange.emit(option);
      }
    });
  }

  private syncScrollPosition(smooth: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) {
      return;
    }

    const options = this.options();
    const selectedIndex = options.indexOf(this.selected());
    if (selectedIndex < 0) {
      return;
    }

    const scrollIndex = this.loop()
      ? getLoopedScrollIndex(selectedIndex, options.length)
      : selectedIndex;
    const top = scrollIndex * TIME_DRUM_ITEM_HEIGHT;
    if (Math.abs(viewport.scrollTop - top) < 1) {
      return;
    }

    this.setScrollTop(viewport, top, smooth);
  }

  private resolveOption(
    rawIndex: number,
    options: (number | string)[],
  ): number | string | undefined {
    if (options.length === 0) {
      return undefined;
    }
    if (this.loop()) {
      return options[getLoopedOptionIndex(rawIndex, options.length)];
    }
    return options[rawIndex];
  }

  private setScrollTop(viewport: HTMLElement, top: number, smooth: boolean): void {
    this.syncingScroll = true;
    if (typeof viewport.scrollTo === 'function') {
      try {
        viewport.scrollTo({
          top,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } catch {
        viewport.scrollTop = top;
      }
    } else {
      viewport.scrollTop = top;
    }
    requestAnimationFrame(() => {
      this.syncingScroll = false;
    });
  }
}
