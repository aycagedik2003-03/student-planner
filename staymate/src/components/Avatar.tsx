import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PALETTES = [
  ['#1FBFCC', '#8E5CD9'],
  ['#8E5CD9', '#D93B8B'],
  ['#D93B8B', '#FF9ACD'],
  ['#1FBFCC', '#D93B8B'],
] as const;

interface AvatarProps {
  size?: number;
  label?: string;
  hue?: 0 | 1 | 2 | 3;
  uri?: string;
}

export function Avatar({ size = 48, label = '?', hue = 0 }: AvatarProps) {
  const palette = PALETTES[hue % PALETTES.length];
  const fontSize = size * 0.38;

  return (
    <LinearGradient
      colors={palette as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.root, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.label, { fontSize }]}>{(label ?? '?').charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root:  { alignItems: 'center', justifyContent: 'center' },
  label: { color: '#fff', fontWeight: '800', letterSpacing: -0.5 },
});
