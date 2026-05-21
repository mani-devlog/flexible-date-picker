import {
  applyFlexThemeTokens,
  clearFlexThemeTokens,
  flexThemeTokensToStyle,
} from './flex-theme-tokens';

describe('flexThemeTokens', () => {
  it('should map tokens to CSS custom property style keys', () => {
    expect(
      flexThemeTokensToStyle({
        primary: '#e11d48',
        surface: '#fff1f2',
      }),
    ).toEqual({
      '--flex-primary': '#e11d48',
      '--flex-surface': '#fff1f2',
    });
  });

  it('should return an empty object when tokens are undefined', () => {
    expect(flexThemeTokensToStyle(undefined)).toEqual({});
  });

  it('should apply and clear tokens on an element', () => {
    const el = document.createElement('div');
    applyFlexThemeTokens(el, { primary: '#7c3aed', radius: '1rem' });
    expect(el.style.getPropertyValue('--flex-primary')).toBe('#7c3aed');
    expect(el.style.getPropertyValue('--flex-radius')).toBe('1rem');
    clearFlexThemeTokens(el);
    expect(el.style.getPropertyValue('--flex-primary')).toBe('');
    expect(el.style.getPropertyValue('--flex-radius')).toBe('');
  });
});
