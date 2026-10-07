import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  /** Required: icon-only buttons must be described for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
  background?: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Icon-only button with a touch area of at least 44×44.
 */
export const IconButton = ({
  icon,
  accessibilityLabel,
  onPress,
  color,
  background,
  size = 22,
  disabled,
  style,
  testID,
}: IconButtonProps) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      testID={testID}
      style={({ pressed }) => [
        {
          minWidth: theme.minTouch,
          minHeight: theme.minTouch,
          borderRadius: theme.radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background ?? 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color ?? theme.colors.text} />
    </Pressable>
  );
};
