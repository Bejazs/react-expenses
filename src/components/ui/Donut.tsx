import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme';

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

/**
 * Segmented ring drawn with react-native-svg. `children` are centered inside it.
 */
export const Donut = ({ segments, size = 180, thickness = 22, accessibilityLabel, children }: DonutProps) => {
  const theme = useTheme();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  let offset = 0;

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.track} strokeWidth={thickness} fill="none" />
          {total > 0 &&
            segments.map(segment => {
              const length = (Math.max(0, segment.value) / total) * circumference;
              const circle = (
                <Circle
                  key={segment.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  fill="none"
                />
              );
              offset += length;
              return circle;
            })}
        </G>
      </Svg>
      {children}
    </View>
  );
};
