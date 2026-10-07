import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Section title with an optional link ("Ver todas") whose touch area is 44 px tall.
 */
export const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
      <Text accessibilityRole="header" style={[theme.typography.heading, { color: theme.colors.text, flexShrink: 1 }]}>
        {title}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="link"
          style={{ minHeight: theme.minTouch, minWidth: theme.minTouch, justifyContent: 'center', paddingHorizontal: theme.spacing.sm }}
        >
          <Text style={[theme.typography.label, { color: theme.colors.accentText }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};
