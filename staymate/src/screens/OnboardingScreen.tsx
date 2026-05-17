import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const handleStart = () => navigation.navigate('Auth', { mode: 'register' });
  const handleLogin = () => navigation.navigate('Auth', { mode: 'login' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>

        {/* Logo */}
        <View style={{
          width: 80, height: 80, backgroundColor: '#1D9E75', borderRadius: 20,
          justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        }}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#fff' }}>s</Text>
        </View>

        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
          staymate
        </Text>

        <Text style={{ fontSize: 14, color: '#888', marginBottom: 40, textAlign: 'center' }}>
          Kişilik uyumuna dayalı oda arkadaşı bul
        </Text>

        {/* Hero placeholder */}
        <View style={{
          width: '100%', height: 300, backgroundColor: '#E1F5EE', borderRadius: 20,
          marginBottom: 40, justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 60 }}>🏠</Text>
        </View>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 12 }}>
          {t('common.welcome')}
        </Text>

        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
          Polonya'da mükemmel oda arkadaşını bul. Kişilik, yaşam tarzı ve tercihlere göre eşleş.
        </Text>

        {/* Başla button */}
        <Pressable
          onPress={handleStart}
          style={{
            width: '100%', backgroundColor: '#1D9E75',
            paddingVertical: 14, borderRadius: 12, marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            {t('common.start')} →
          </Text>
        </Pressable>

        {/* Giriş Yap link */}
        <Pressable onPress={handleLogin}>
          <Text style={{ color: '#888', fontSize: 14 }}>
            {t('auth.alreadyHaveAccount')}
          </Text>
        </Pressable>

        {/* Footer */}
        <Text style={{ marginTop: 40, fontSize: 12, color: '#ccc', textAlign: 'center', marginBottom: 20 }}>
          Devam ederek Kullanım Şartlarını kabul etmiş olursunuz.
        </Text>
      </View>
    </ScrollView>
  );
}
