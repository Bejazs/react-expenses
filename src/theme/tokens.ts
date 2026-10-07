/**
 * Design tokens for the "Acolhedor" theme (option C), light and dark.
 * This folder is the only place in the app where hex colors are written.
 */
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  track: string;
  accent: string;
  onAccent: string;
  /** Links and active states. */
  accentText: string;
  fixed: string;
  variable: string;
  estimate: string;
  ok: string;
  warn: string;
  /** Destructive actions and money going out. */
  danger: string;
  peach: string;
  mint: string;
  lavender: string;
  butter: string;
  /** Hairlines and input borders. */
  border: string;
  /** Translucent backdrop behind modals. */
  overlay: string;
  /** Shadow color for cards. */
  shadow: string;
  /** Icons drawn on top of a category color. */
  onCategory: string;
}

export const palettes: Record<ColorScheme, ThemeColors> = {
  light: {
    bg: '#FFF6EE',
    surface: '#FFFFFF',
    text: '#2A221E',
    muted: '#6B5F57',
    track: '#F3E7DD',
    accent: '#C04A1F',
    onAccent: '#FFFFFF',
    accentText: '#A83F18',
    fixed: '#2F6FDB',
    variable: '#7B5CD6',
    estimate: '#8A7F78',
    ok: '#2F8F5B',
    warn: '#B04A00',
    danger: '#B42318',
    peach: '#FFE3D3',
    mint: '#D9F1E3',
    lavender: '#E7E2FA',
    butter: '#FFEFC4',
    border: '#EADBCF',
    overlay: 'rgba(42, 34, 30, 0.45)',
    shadow: '#7A4A2E',
    onCategory: '#FFFFFF',
  },
  dark: {
    bg: '#151929',
    surface: '#20253A',
    text: '#F4F0EA',
    muted: '#AAB0C6',
    track: '#2E3450',
    accent: '#FF8A65',
    onAccent: '#1B1410',
    accentText: '#FFA98C',
    fixed: '#8FB0FF',
    variable: '#B59CFF',
    estimate: '#6E7594',
    ok: '#7FD6A8',
    warn: '#FFB35C',
    danger: '#FF9A8F',
    peach: '#3B2A2A',
    mint: '#1F3A33',
    lavender: '#2D2A4A',
    butter: '#3A3522',
    border: '#353B58',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    onCategory: '#FFFFFF',
  },
};

export const radii = {
  card: 24,
  inner: 18,
  input: 14,
  pill: 999,
};

/** Base-4 spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  screen: 18,
  xl: 24,
  xxl: 32,
};

/** Minimum size for anything tappable. */
export const MIN_TOUCH = 44;

/**
 * Colors users can pick for their categories. Chosen to read well with white
 * icons on both light and dark backgrounds.
 */
export const CATEGORY_COLORS = [
  '#C04A1F', '#B04A00', '#8A6D00', '#2F8F5B', '#1F7A7A', '#2F6FDB',
  '#4B5BD6', '#7B5CD6', '#A23E8C', '#C2185B', '#6B5F57', '#455A64',
];
