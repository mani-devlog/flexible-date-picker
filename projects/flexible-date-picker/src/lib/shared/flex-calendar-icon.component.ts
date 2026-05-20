import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'flex-calendar-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 3v2M17 3v2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        stroke-width="2"
      />
      <path d="M3 10h18" stroke="currentColor" stroke-width="2" />
      <rect x="7" y="13" width="2" height="2" fill="currentColor" />
      <rect x="11" y="13" width="2" height="2" fill="currentColor" />
      <rect x="15" y="13" width="2" height="2" fill="currentColor" />
      <rect x="7" y="16" width="2" height="2" fill="currentColor" />
      <rect x="11" y="16" width="2" height="2" fill="currentColor" />
      <rect x="15" y="16" width="2" height="2" fill="currentColor" />
      <rect x="7" y="19" width="2" height="2" fill="currentColor" />
      <rect x="11" y="19" width="2" height="2" fill="currentColor" />
      <rect x="15" y="19" width="2" height="2" fill="currentColor" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class FlexCalendarIconComponent {}
