import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  size?: number;
  showText?: boolean;
  textColor?: string;
};

/**
 * Roomski marka logosu — cyan→magenta gradient arka plan üzerinde 🏘️ + "R"
 * assets/roomski-logo.png eklendiğinde Image ile değiştirilebilir.
 */
export default function RoomskiLogo({ size = 80, showText = false, textColor = '#fff' }: Props) {
  const radius = size * 0.25;
  const fontSize = size * 0.45;

  return (
    <View style={{ alignItems: 'center' }}>
      <LinearGradient
        colors={['#00BCD4', '#E91E63']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[st.container, { width: size, height: size, borderRadius: radius }]}
      >
        <Text style={[st.icon, { fontSize: fontSize }]}>🏘️</Text>
      </LinearGradient>

      {showText && (
        <Text style={[st.wordmark, { color: textColor }]}>roomski</Text>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  icon:      { lineHeight: undefined },
  wordmark:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginTop: 8 },
});
