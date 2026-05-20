import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT } from '../utils/constants';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 48 }: LogoProps) {
  const fontSize = size * 0.38;
  return (
    <LinearGradient
      colors={GRADIENT.brand as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.28, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize, fontWeight: '900', letterSpacing: -1 }}>R</Text>
    </LinearGradient>
  );
}
