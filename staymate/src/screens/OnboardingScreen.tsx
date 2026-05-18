import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

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
    <LinearGradient
      colors={['#E0F7FA', '#FCE4EC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Dil seçici */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8, marginTop: 16, paddingHorizontal: 20 }}>
          {(['pl', 'tr', 'en'] as const).map(lang => (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: language === lang ? '#00BCD4' : 'rgba(255,255,255,0.7)',
                borderWidth: 1,
                borderColor: language === lang ? '#00BCD4' : 'rgba(0,188,212,0.4)',
              }}
            >
              <Text style={{
                color: language === lang ? '#fff' : '#00838F',
                fontWeight: language === lang ? '700' : '500',
                fontSize: 14,
              }}>
                {lang === 'pl' ? 'Polski' : lang === 'tr' ? 'Türkçe' : 'English'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>

          {/* Logo */}
          <Image
            source={require('../../assets/roomski-logo.png')}
            style={{ width: 100, height: 94, marginTop: 16, marginBottom: 12 }}
            resizeMode="contain"
          />

          <Text style={{ fontSize: 30, fontWeight: '800', color: '#1F2937', marginBottom: 4, letterSpacing: -0.5 }}>
            roomski
          </Text>
          <Text style={{ fontSize: 12, color: '#E91E63', fontWeight: '600', marginBottom: 28, letterSpacing: 0.3 }}>
            find your people. feel at home.
          </Text>

          {/* Hero — gradient card */}
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%', height: 240, borderRadius: 24,
              marginBottom: 32, justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 80 }}>🏘️</Text>
          </LinearGradient>

          {/* Highlight badge */}
          <Text style={{ fontSize: 13, color: '#00BCD4', marginBottom: 8, fontWeight: '600' }}>
            {texts.highlight}
          </Text>

          {/* Subtitle */}
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 12, textAlign: 'center', letterSpacing: -0.4 }}>
            {texts.subtitle}
          </Text>

          {/* Description */}
          <Text style={{ fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 36, lineHeight: 24 }}>
            {texts.description}
          </Text>

          {/* CTA — gradient button */}
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%', borderRadius: 14, marginBottom: 14 }}
          >
            <Pressable
              onPress={handleStart}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {texts.cta} →
              </Text>
            </Pressable>
          </LinearGradient>

          {/* Giriş Yap — outline */}
          <Pressable
            onPress={handleLogin}
            style={{
              width: '100%', paddingVertical: 14, borderRadius: 14,
              borderWidth: 2, borderColor: '#00BCD4',
              backgroundColor: 'rgba(255,255,255,0.6)',
              alignItems: 'center', marginBottom: 12,
            }}
          >
            <Text style={{ color: '#00BCD4', fontSize: 15, fontWeight: '600' }}>
              {t('auth.alreadyHaveAccount')}
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={{ marginTop: 16, fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 28 }}>
            {t('auth.continueText')}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
