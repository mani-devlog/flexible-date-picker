import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FlexThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  setDarkMode(enabled: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.documentElement.classList.toggle('dark', enabled);
    this.document.documentElement.setAttribute('data-flex-theme', enabled ? 'dark' : 'light');
  }

  toggleDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const isDark = this.document.documentElement.classList.contains('dark');
    this.setDarkMode(!isDark);
  }
}
