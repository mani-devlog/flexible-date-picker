import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import {
  applyFlexThemeTokens,
  clearFlexThemeTokens,
  type FlexThemeTokens,
} from '../themes/flex-theme-tokens';
import type { FlexColorScheme } from '../types';

@Injectable({ providedIn: 'root' })
export class FlexThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** Applies a color scheme to the document root (`<html>`). */
  setColorScheme(scheme: FlexColorScheme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const root = this.document.documentElement;
    root.setAttribute('data-flex-theme', scheme);
    if (scheme === 'auto') {
      root.classList.remove('dark');
      return;
    }
    root.classList.toggle('dark', scheme === 'dark');
  }

  setDarkMode(enabled: boolean): void {
    this.setColorScheme(enabled ? 'dark' : 'light');
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  getColorScheme(): FlexColorScheme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }
    const scheme = this.document.documentElement.getAttribute('data-flex-theme');
    if (scheme === 'dark' || scheme === 'auto') {
      return scheme;
    }
    return 'light';
  }

  isDarkMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const scheme = this.getColorScheme();
    if (scheme === 'dark') {
      return true;
    }
    if (scheme === 'auto') {
      return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    }
    return this.document.documentElement.classList.contains('dark');
  }

  /** Applies custom color overrides on the document root; use with or without `setColorScheme`. */
  applyCustomColors(tokens: FlexThemeTokens): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    applyFlexThemeTokens(this.document.documentElement, tokens);
  }

  /** Removes document-root overrides set via `applyCustomColors`. */
  clearCustomColors(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    clearFlexThemeTokens(this.document.documentElement);
  }
}
