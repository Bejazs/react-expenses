import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  /** 0..1 (values above 1 are shown as full). */
  progress: number;
  /** Threshold from which the bar shows the warning state. */
  warnAt?: number;
  color?: string;
  showLabel?: boolean;
  accessibilityLabel?: string;
}

/**
 * Progress bar that never relies on color alone: it shows the percentage
 * and a warning icon once `warnAt` is reached.
 */
export const ProgressBar = ({ progress, warnAt = 0.8, color, showLabel = true, accessibilityLabel }: ProgressBarProps) => {
  const theme = useTheme();
  const safe = Number.isFinite(progress) ? Math.max(0, progress) : 0;
  const warn = safe >= warnAt;
  const fill = warn ? theme.colors.warn : color ?? theme.colors.ok;
  const percent = Math.round(safe * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.min(percent, 100) }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
    >
      <View style={{ flex: 1, height: 10, borderRadius: theme.radii.pill, backgroundColor: theme.colors.track, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(safe, 1) * 100}%`, height: '100%', borderRadius: theme.radii.pill, backgroundColor: fill }} />
      </View>
      {showLabel && (
        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 48, justifyContent: 'flex-end' }}>
          {warn && <Ionicons name="warning" size={14} color={theme.colors.warn} style={{ marginRight: 2 }} />}
          <Text style={[theme.typography.caption, { color: warn ? theme.colors.warn : theme.colors.muted, fontFamily: theme.fonts.bodyBold }]}>
            {percent}%
          </Text>
        </View>
      )}
    </View>
  );
};
