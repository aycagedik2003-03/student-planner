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

const motivationalTexts = {
  pl: {
    highlight:   '🏘️ Roomski - Polska innowacja',
    subtitle:    'Znajdź współlokatora, który rozumie Ciebie',
    description: 'Roomski zmienia sposób, w jaki polscy studenci szukają wspólnika. Niech algorytm AI robi pracę. Ty ciesz się życiem.',
    cta:         'Dołącz do Roomski',
  },
  tr: {
    highlight:   "🏘️ Roomski - Polonya'nın Yeni Çağı",
    subtitle:    'Seni anlayan oda arkadaşını bul',
    description: 'Roomski, yapay zeka ile öğrencileri ev sahipleriyle mükemmel şekilde eşleştirir. Kişiliğine, bütçene, yaşam tarzına uygun bulunuz.',
    cta:         "Roomski'ye Katıl",
  },
  en: {
    highlight:   "🏘️ Roomski - Poland's Innovation",
    subtitle:    'Find a roommate who gets you',
    description: "Roomski uses AI to match Polish students with perfect roommates. No more guessing games. Just smart matching.",
    cta:         'Join Roomski',
  },
};

export default function OnboardingScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);

  const handleStart = () => navigation.navigate('Auth', { mode: 'register' });
  const handleLogin = () => navigation.navigate('Auth', { mode: 'login' });

  const texts = motivationalTexts[language] ?? motivationalTexts.en;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Modern dil seçici */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24, marginTop: 16, paddingHorizontal: 20 }}>
        {(['pl', 'tr', 'en'] as const).map(lang => (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: language === lang ? '#1D9E75' : '#E1F5EE',
              borderWidth: 1,
              borderColor: '#1D9E75',
            }}
          >
            <Text style={{
              color: language === lang ? '#fff' : '#1D9E75',
              fontWeight: language === lang ? '700' : '500',
              fontSize: 14,
            }}>
              {lang === 'pl' ? 'Polski' : lang === 'tr' ? 'Türkçe' : 'English'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>

        {/* Logo */}
        <View style={{
          width: 80, height: 80, backgroundColor: '#1D9E75', borderRadius: 20,
          justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 0,
        }}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#fff' }}>s</Text>
        </View>

        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
          Roomski
        </Text>

        {/* Hero image placeholder */}
        <View style={{
          width: '100%', height: 260, backgroundColor: '#E1F5EE', borderRadius: 20,
          marginBottom: 32, justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 60 }}>🏠</Text>
        </View>

        {/* Highlight badge */}
        <Text style={{ fontSize: 14, color: '#1D9E75', marginBottom: 8, fontWeight: '600' }}>
          {texts.highlight}
        </Text>

        {/* Subtitle */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 12, textAlign: 'center' }}>
          {texts.subtitle}
        </Text>

        {/* Description */}
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
          {texts.description}
        </Text>

        {/* CTA butonu */}
        <Pressable
          onPress={handleStart}
          style={{
            width: '100%',
            backgroundColor: '#1D9E75',
            paddingVertical: 14,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            {texts.cta} →
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
          {t('auth.continueText')}
        </Text>
      </View>
    </ScrollView>
  );
}
