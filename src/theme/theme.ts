import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { ColorScheme, MIN_TOUCH, palettes, radii, spacing, ThemeColors } from './tokens';
import { fonts, typography } from './typography';

export type Appearance = 'system' | 'light' | 'dark';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  radii: typeof radii;
  spacing: typeof spacing;
  fonts: typeof fonts;
  typography: typeof typography;
  minTouch: number;
  navigation: NavigationTheme;
}

/**
 * Picks the color scheme from the user's preference and the system setting.
 */
export const resolveScheme = (
  appearance: Appearance | undefined,
  system: string | null | undefined
): ColorScheme => {
  if (appearance === 'light' || appearance === 'dark') return appearance;
  return system === 'dark' ? 'dark' : 'light';
};

export const buildTheme = (scheme: ColorScheme): Theme => {
  const colors = palettes[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    scheme,
    colors,
    radii,
    spacing,
    fonts,
    typography,
    minTouch: MIN_TOUCH,
    navigation: {
      ...base,
      dark: scheme === 'dark',
      colors: {
        ...base.colors,
        primary: colors.accentText,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    },
  };
};

/**
 * Returns an rgba() string for a #RRGGBB color, for libraries that need opacity.
 */
export const withOpacity = (hex: string, opacity: number): string => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
