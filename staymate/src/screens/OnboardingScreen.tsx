import React from 'react';
import {
  View, Text, Pressable, Image, Dimensions,
  StatusBar, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width, height } = Dimensions.get('window');

// Logo path (kök assets/ klasöründe)
const LOGO = require('../../assets/roomski-logo.png');

const HERO = require('../../assets/roomski-hero.png');

const CONTENT = {
  pl: { cta: 'Zacznij',      loginLink: 'Mam już konto'    },
  tr: { cta: 'Başla',        loginLink: 'Hesabım var'       },
  en: { cta: 'Get started',  loginLink: 'I have an account' },
} as const;

type Lang = keyof typeof CONTENT;

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }: Props) {
  const { language } = useTranslation();
  const setLanguage  = useAppStore(s => s.setLanguage);

  const lang    = (language in CONTENT ? language : 'en') as Lang;
  const current = CONTENT[lang];

  return (
    <SafeAreaView style={st.root} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={st.container}>
        {/* ── HERO IMAGE ────────────────────────────────────────────────────── */}
        <Image source={HERO} style={st.hero} resizeMode="cover" />

        {/* ── BOTTOM PANEL ──────────────────────────────────────────────────── */}
        <View style={st.bottom}>
          {/* Logo + wordmark */}
          <View style={st.logoRow}>
            <Image source={LOGO} style={st.logoImg} resizeMode="contain" />
            <Text style={st.logoWord}>roomski</Text>
          </View>

          {/* Tagline */}
          <Text style={st.tagline}>Find your people.</Text>
          <Text style={[st.tagline, st.taglineAccent]}>Feel at home.</Text>

          {/* Description */}
          <Text style={st.desc}>
            The easiest way to find a roommate{'\n'}and a place you'll love.
          </Text>

          {/* CTA — gradient pill */}
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={st.ctaGrad}
          >
            <Pressable
              onPress={() => navigation.navigate('Auth', { mode: 'register' })}
              style={st.ctaBtn}
            >
              <Text style={st.ctaTxt}>{current.cta}</Text>
            </Pressable>
          </LinearGradient>

          {/* Login link */}
          <Pressable
            onPress={() => navigation.navigate('Auth', { mode: 'login' })}
            style={st.loginBtn}
          >
            <Text style={st.loginTxt}>{current.loginLink}</Text>
          </Pressable>

          {/* Language selector */}
          <View style={st.langRow}>
            {(['pl', 'tr', 'en'] as const).map(l => (
              <Pressable
                key={l}
                onPress={() => setLanguage(l)}
                style={[st.langBtn, lang === l && st.langBtnActive]}
              >
                <Text style={[st.langTxt, lang === l && st.langTxtActive]}>
                  {l === 'pl' ? 'PL' : l === 'tr' ? 'TR' : 'EN'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const HERO_H = height * 0.52;

const st = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },

  // Hero
  hero: { width, height: HERO_H, overflow: 'hidden', position: 'relative' },

  // Bottom panel
  bottom:    { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: Platform.OS === 'android' ? 16 : 8, backgroundColor: '#fff' },

  // Logo
  logoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logoImg:   { width: 44, height: 44, marginRight: 10 },
  logoWord:  { fontSize: 30, fontWeight: '800', color: '#000', letterSpacing: -1 },

  // Tagline
  tagline:       { fontSize: 26, fontWeight: '800', color: '#000', lineHeight: 34, letterSpacing: -0.4 },
  taglineAccent: { color: '#E91E63', marginBottom: 10 },

  // Description
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 24 },

  // CTA
  ctaGrad: { borderRadius: 30, marginBottom: 12 },
  ctaBtn:  { paddingVertical: 16, alignItems: 'center' },
  ctaTxt:  { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  // Login
  loginBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 16 },
  loginTxt: { color: '#999', fontSize: 14, fontWeight: '500' },

  // Lang
  langRow:       { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  langBtn:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 16, backgroundColor: '#F3F4F6' },
  langBtnActive: { backgroundColor: '#00BCD4' },
  langTxt:       { fontSize: 12, fontWeight: '500', color: '#666' },
  langTxtActive: { color: '#fff', fontWeight: '700' },
});
