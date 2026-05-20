import { Injectable, signal } from '@angular/core';
import type { WeekStart } from '../types';

@Injectable({ providedIn: 'root' })
export class FlexLocaleService {
  readonly localeCode = signal('en');
  readonly weekStartsOn = signal<WeekStart>(0);

  setLocale(code: string): void {
    this.localeCode.set(code);
  }

  setWeekStartsOn(day: WeekStart): void {
    this.weekStartsOn.set(day);
  }
}
