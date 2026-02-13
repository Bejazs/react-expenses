import React from 'react';
import { Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Component to display a category icon.
 * It can render either a vector icon (Ionicons) or a custom image (URI).
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, size = 24, color = 'black', style }) => {
  if (!icon) return null;

  // detailed check for URI schemes commonly used in React Native
  const isCustomImage = icon.startsWith('file://') || icon.startsWith('content://') || icon.startsWith('http://') || icon.startsWith('https://');

  if (isCustomImage) {
    return (
      <Image
        source={{ uri: icon }}
        style={[
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <Ionicons
      name={icon as any}
      size={size}
      color={color}
      style={style}
    />
  );
};
