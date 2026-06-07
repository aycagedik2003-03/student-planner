import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT, RADII, SHADOW } from '../utils/constants';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function GradientButton({ label, onPress, loading, disabled }: GradientButtonProps) {
  const inactive = disabled || loading;
  return (
    <LinearGradient
      colors={inactive ? ['#D1D5DB', '#D1D5DB'] as const : GRADIENT.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[s.wrap, !inactive && SHADOW.glow]}
    >
      <Pressable style={s.inner} onPress={onPress} disabled={inactive}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={s.label} adjustsFontSizeToFit numberOfLines={1}>{label}</Text>
        }
      </Pressable>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  wrap:  { borderRadius: RADII.pill, overflow: 'hidden', marginBottom: 16 },
  inner: { height: 56, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
