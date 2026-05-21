import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FlexThemeService } from './flex-theme.service';

describe('FlexThemeService', () => {
  let service: FlexThemeService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlexThemeService);
    document = TestBed.inject(DOCUMENT);
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-flex-theme');
  });

  it('should set dark mode on the document root', () => {
    service.setDarkMode(true);
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(document.documentElement.getAttribute('data-flex-theme')).toBe('dark');
    expect(service.isDarkMode()).toBeTrue();
  });

  it('should set light mode on the document root', () => {
    service.setDarkMode(true);
    service.setDarkMode(false);
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(document.documentElement.getAttribute('data-flex-theme')).toBe('light');
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should apply auto color scheme without the dark class', () => {
    service.setColorScheme('auto');
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(document.documentElement.getAttribute('data-flex-theme')).toBe('auto');
    expect(service.getColorScheme()).toBe('auto');
  });

  it('should toggle dark mode', () => {
    service.setDarkMode(false);
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBeTrue();
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should apply custom colors on the document root', () => {
    service.applyCustomColors({ primary: '#be123c', surface: '#ffe4e6' });
    expect(document.documentElement.style.getPropertyValue('--flex-primary')).toBe('#be123c');
    expect(document.documentElement.style.getPropertyValue('--flex-surface')).toBe('#ffe4e6');
  });

  it('should clear custom colors from the document root', () => {
    service.applyCustomColors({ primary: '#be123c' });
    service.clearCustomColors();
    expect(document.documentElement.style.getPropertyValue('--flex-primary')).toBe('');
  });
});
