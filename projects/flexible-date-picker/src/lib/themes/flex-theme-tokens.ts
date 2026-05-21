/** Partial palette overrides mapped to `--flex-*` CSS custom properties. */
export interface FlexThemeTokens {
  surface?: string;
  surfaceElevated?: string;
  border?: string;
  primary?: string;
  primaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  range?: string;
  today?: string;
  disabled?: string;
  radius?: string;
  shadow?: string;
}

const TOKEN_TO_CSS_VAR: Record<keyof FlexThemeTokens, string> = {
  surface: '--flex-surface',
  surfaceElevated: '--flex-surface-elevated',
  border: '--flex-border',
  primary: '--flex-primary',
  primaryForeground: '--flex-primary-foreground',
  muted: '--flex-muted',
  mutedForeground: '--flex-muted-foreground',
  accent: '--flex-accent',
  accentForeground: '--flex-accent-foreground',
  range: '--flex-range',
  today: '--flex-today',
  disabled: '--flex-disabled',
  radius: '--flex-radius',
  shadow: '--flex-shadow',
};

export const FLEX_THEME_CSS_VARS = Object.values(TOKEN_TO_CSS_VAR);

/** Converts token overrides to inline style properties for a picker host element. */
export function flexThemeTokensToStyle(
  tokens?: FlexThemeTokens | null,
): Record<string, string> {
  if (!tokens) {
    return {};
  }
  const styles: Record<string, string> = {};
  for (const key of Object.keys(TOKEN_TO_CSS_VAR) as (keyof FlexThemeTokens)[]) {
    const value = tokens[key];
    if (value != null && value !== '') {
      styles[TOKEN_TO_CSS_VAR[key]] = value;
    }
  }
  return styles;
}

/** Applies token overrides to a DOM element (e.g. document root). */
export function applyFlexThemeTokens(element: HTMLElement, tokens: FlexThemeTokens): void {
  for (const [property, value] of Object.entries(flexThemeTokensToStyle(tokens))) {
    element.style.setProperty(property, value);
  }
}

/** Removes inline `--flex-*` overrides from a DOM element. */
export function clearFlexThemeTokens(element: HTMLElement): void {
  for (const property of FLEX_THEME_CSS_VARS) {
    element.style.removeProperty(property);
  }
}
