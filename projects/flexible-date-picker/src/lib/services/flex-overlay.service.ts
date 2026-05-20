import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  ElementRef,
  inject,
  signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FlexOverlayService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  readonly isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateMobileState();
      window.addEventListener('resize', () => this.updateMobileState());
    }
  }

  trapFocus(container: HTMLElement): () => void {
    if (!isPlatformBrowser(this.platformId)) {
      return () => undefined;
    }

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(this.focusableSelector),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusable.length === 0) {
        return;
      }
      if (event.shiftKey && this.document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && this.document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }

  listenEscape(onEscape: () => void): () => void {
    if (!isPlatformBrowser(this.platformId)) {
      return () => undefined;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };
    this.document.addEventListener('keydown', handler);
    return () => this.document.removeEventListener('keydown', handler);
  }

  listenOutsideClick(element: ElementRef<HTMLElement>, onOutside: () => void): () => void {
    if (!isPlatformBrowser(this.platformId)) {
      return () => undefined;
    }
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !element.nativeElement.contains(target)) {
        onOutside();
      }
    };
    setTimeout(() => this.document.addEventListener('click', handler, true), 0);
    return () => this.document.removeEventListener('click', handler, true);
  }

  computeVerticalPlacement(anchor: HTMLElement, panel: HTMLElement): 'below' | 'above' {
    if (!isPlatformBrowser(this.platformId)) {
      return 'below';
    }

    const anchorRect = anchor.getBoundingClientRect();
    const panelHeight = panel.getBoundingClientRect().height;
    const gap = 4;
    const viewportPadding = 8;
    const spaceBelow = window.innerHeight - anchorRect.bottom - viewportPadding;
    const spaceAbove = anchorRect.top - viewportPadding;

    if (spaceBelow >= panelHeight + gap) {
      return 'below';
    }
    if (spaceAbove >= panelHeight + gap) {
      return 'above';
    }

    return spaceAbove > spaceBelow ? 'above' : 'below';
  }

  alignOverlay(
    anchor: HTMLElement,
    panel: HTMLElement,
    onPlacement: (placement: 'below' | 'above') => void,
  ): () => void {
    if (!isPlatformBrowser(this.platformId)) {
      return () => undefined;
    }

    const clearPanelConstraints = () => {
      panel.style.maxHeight = '';
      panel.style.overflowY = '';
      panel.style.overflowX = '';
    };

    const update = () => {
      const placement = this.computeVerticalPlacement(anchor, panel);
      onPlacement(placement);

      const anchorRect = anchor.getBoundingClientRect();
      const gap = 4;
      const viewportPadding = 8;
      const availableSpace =
        placement === 'above'
          ? anchorRect.top - viewportPadding - gap
          : window.innerHeight - anchorRect.bottom - viewportPadding - gap;

      if (panel.scrollHeight > availableSpace) {
        panel.style.maxHeight = `${Math.max(availableSpace, 120)}px`;
        panel.style.overflowY = 'auto';
        panel.style.overflowX = 'hidden';
      } else {
        clearPanelConstraints();
      }
    };

    update();
    requestAnimationFrame(update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(panel);
    resizeObserver.observe(anchor);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      clearPanelConstraints();
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }

  private updateMobileState(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
}
