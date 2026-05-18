import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  showText?: boolean;
  textColor?: string;
};

export default function RoomskiLogo({ size = 80, showText = false, textColor = '#fff' }: Props) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image
        source={require('../../assets/roomski-logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[st.wordmark, { color: textColor }]}>roomski</Text>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  wordmark: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginTop: 8 },
});
