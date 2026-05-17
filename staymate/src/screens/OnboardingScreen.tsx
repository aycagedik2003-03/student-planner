import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const languageButtons = [
  { code: 'tr' as const, label: 'Türkçe' },
  { code: 'pl' as const, label: 'Polski' },
  { code: 'en' as const, label: 'English' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);

  const handleStart = () => navigation.navigate('Auth', { mode: 'register' });
  const handleLogin = () => navigation.navigate('Auth', { mode: 'login' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Dil seçeneği — EN ÜSTTE */}
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        {languageButtons.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 16,
              backgroundColor: language === lang.code ? '#1D9E75' : '#E1F5EE',
            }}
          >
            <Text style={{
              color: language === lang.code ? '#fff' : '#085041',
              fontSize: 11,
              fontWeight: '500',
            }}>
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>

        {/* Logo */}
        <View style={{
          width: 80, height: 80, backgroundColor: '#1D9E75', borderRadius: 20,
          justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 20,
        }}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#fff' }}>s</Text>
        </View>

        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
          staymate
        </Text>

        <Text style={{ fontSize: 14, color: '#888', marginBottom: 40, textAlign: 'center' }}>
          {language === 'pl'
            ? 'Znajdź idealnego współlokatora na podstawie osobowości'
            : language === 'en'
            ? 'Find the perfect roommate based on personality'
            : 'Kişilik uyumuna dayalı oda arkadaşı bul'}
        </Text>

        {/* Hero image placeholder */}
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
          {language === 'pl'
            ? 'W Polsce nie ma jeszcze takiej aplikacji. Ty możesz być pierwszym!'
            : language === 'en'
            ? "There's no app like this in Poland yet. Be the first!"
            : "Polonya'da böyle bir app henüz yok. Sen ilk olabilirsin!"}
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
          <Text style={{ color: '#1D9E75', fontSize: 14, fontWeight: '500' }}>
            {t('auth.alreadyHaveAccount')}
          </Text>
        </Pressable>

        {/* Footer */}
        <Text style={{ marginTop: 40, fontSize: 12, color: '#ccc', textAlign: 'center', marginBottom: 20 }}>
          {language === 'pl'
            ? 'Kontynuując, akceptujesz warunki użytkowania.'
            : language === 'en'
            ? 'By continuing, you accept the terms of service.'
            : 'Devam ederek şartları kabul etmiş olursunuz.'}
        </Text>
      </View>
    </ScrollView>
  );
}
