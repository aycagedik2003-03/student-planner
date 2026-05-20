import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, RADII, SHADOW } from '../utils/constants';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ children, padding = 16, radius = RADII.lg, elevated = false, style }: CardProps) {
  return (
    <View
      style={[
        s.base,
        { padding, borderRadius: radius },
        elevated && s.elevated,
        style,
      ]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  elevated: {
    ...SHADOW.card,
  },
});
