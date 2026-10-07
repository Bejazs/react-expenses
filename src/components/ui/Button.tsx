import React from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Text button, at least 44 px tall. Primary is coral with `onAccent` text.
 */
export const Button = ({ label, onPress, variant = 'primary', disabled, style, testID }: ButtonProps) => {
  const theme = useTheme();
  const { colors } = theme;
  const background = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.track;
  const foreground = variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.surface : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      testID={testID}
      style={({ pressed }) => [
        {
          minHeight: theme.minTouch,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radii.pill,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[theme.typography.bodyStrong, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
};
