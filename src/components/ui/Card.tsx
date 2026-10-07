import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { Theme, useThemedStyles } from '../../theme';
import { ThemeColors } from '../../theme/tokens';

type Tone = 'surface' | 'peach' | 'mint' | 'lavender' | 'butter' | 'accent';

interface CardProps extends ViewProps {
  tone?: Tone;
  inner?: boolean;
  style?: StyleProp<ViewStyle>;
}

const toneColor = (colors: ThemeColors, tone: Tone) => (tone === 'surface' ? colors.surface : colors[tone]);

/**
 * Rounded container used for every block of content.
 */
export const Card = ({ tone = 'surface', inner = false, style, ...rest }: CardProps) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={[styles.card, inner && styles.inner, { backgroundColor: toneColor(styles.colors, tone) }, style]}
      {...rest}
    />
  );
};

const createStyles = (theme: Theme) => ({
  colors: theme.colors,
  ...StyleSheet.create({
    card: {
      borderRadius: theme.radii.card,
      padding: theme.spacing.screen,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme.scheme === 'dark' ? 0 : 0.08,
      shadowRadius: 14,
      elevation: theme.scheme === 'dark' ? 0 : 3,
    },
    inner: {
      borderRadius: theme.radii.inner,
      padding: theme.spacing.lg,
      shadowOpacity: 0,
      elevation: 0,
    },
  }),
});
