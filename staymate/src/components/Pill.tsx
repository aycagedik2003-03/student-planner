import React from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT, RADII, SHADOW } from '../utils/constants';

interface PillProps {
  children: React.ReactNode;
  variant?: 'grad' | 'ghost' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  glow?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
  style?: ViewStyle;
}

const SIZE = {
  sm: { px: 12, py: 6,  fontSize: 12, height: 32 },
  md: { px: 16, py: 10, fontSize: 14, height: 42 },
  lg: { px: 20, py: 14, fontSize: 16, height: 52 },
};

export function Pill({
  children,
  variant = 'solid',
  size = 'md',
  block = false,
  glow = false,
  onPress,
  leading,
  style,
}: PillProps) {
  const sz = SIZE[size];

  const inner = (
    <View style={[s.inner, { paddingHorizontal: sz.px, paddingVertical: sz.py }, block && s.block]}>
      {leading && <View style={{ marginRight: 6 }}>{leading}</View>}
      <Text
        style={[
          s.label,
          { fontSize: sz.fontSize },
          variant === 'ghost' || variant === 'outline'
            ? { color: COLORS.ink }
            : { color: '#fff' },
        ]}>
        {children}
      </Text>
    </View>
  );

  if (variant === 'grad') {
    return (
      <Pressable onPress={onPress} style={[block && s.blockWrap, style]}>
        <LinearGradient
          colors={GRADIENT.brand as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.base, { borderRadius: RADII.pill }, glow && SHADOW.glow]}>
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        s.base,
        { borderRadius: RADII.pill },
        variant === 'solid'   && { backgroundColor: COLORS.ink },
        variant === 'ghost'   && { backgroundColor: 'transparent' },
        variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.line },
        block && s.blockWrap,
        style,
      ]}>
      {inner}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base:      { overflow: 'hidden' },
  blockWrap: { alignSelf: 'stretch' },
  inner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  block:     { alignSelf: 'stretch' },
  label:     { fontWeight: '700', letterSpacing: 0.1 },
});
