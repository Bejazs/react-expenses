import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { buildTheme, resolveScheme, Theme } from './theme';

const ThemeContext = createContext<Theme>(buildTheme('light'));

/**
 * Provides the current theme. Follows the system scheme unless the user
 * forced light or dark in Settings → Appearance.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const appearance = useAppStore(s => s.settings.appearance);
  const scheme = resolveScheme(appearance, system);
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Builds a StyleSheet-like object from the theme, memoized per theme.
 */
export const useThemedStyles = <T,>(factory: (theme: Theme) => T): T => {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
};
