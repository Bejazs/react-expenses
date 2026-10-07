import { buildTheme, resolveScheme } from './theme';
import { palettes, ThemeColors } from './tokens';

/** WCAG relative luminance contrast ratio between two #RRGGBB colors. */
const contrast = (a: string, b: string) => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('resolveScheme', () => {
  it('follows the system by default', () => {
    expect(resolveScheme(undefined, 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('light');
  });

  it('lets the user force a scheme', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('light', 'dark')).toBe('light');
  });
});

describe('buildTheme', () => {
  it.each(['light', 'dark'] as const)('matches the %s snapshot', scheme => {
    const theme = buildTheme(scheme);
    expect(theme.navigation.dark).toBe(scheme === 'dark');
    expect({ colors: theme.colors, navigation: theme.navigation.colors }).toMatchSnapshot();
  });
});

describe('contrast (WCAG AA, 4.5:1 for text)', () => {
  const textPairs: [keyof ThemeColors, keyof ThemeColors][] = [
    ['text', 'bg'],
    ['text', 'surface'],
    ['muted', 'bg'],
    ['muted', 'surface'],
    ['onAccent', 'accent'],
    ['accentText', 'surface'],
    ['accentText', 'bg'],
    ['danger', 'surface'],
    ['warn', 'surface'],
    ['text', 'peach'],
    ['text', 'mint'],
    ['text', 'lavender'],
    ['text', 'butter'],
  ];

  it.each(['light', 'dark'] as const)('%s palette meets 4.5:1 for every text pair', scheme => {
    const colors = palettes[scheme];
    for (const [fg, bg] of textPairs) {
      expect({ pair: `${fg} on ${bg}`, ok: contrast(colors[fg], colors[bg]) >= 4.5 }).toEqual({
        pair: `${fg} on ${bg}`,
        ok: true,
      });
    }
  });
});
