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

// Hero image — assets/roomski-hero.png dosyasını eklediğinde
// aşağıdaki satırı uncomment et ve HeroPlaceholder bileşenini kaldır:
// const HERO = require('../../assets/roomski-hero.png');

const CONTENT = {
  pl: { cta: 'Zacznij',      loginLink: 'Mam już konto'    },
  tr: { cta: 'Başla',        loginLink: 'Hesabım var'       },
  en: { cta: 'Get started',  loginLink: 'I have an account' },
} as const;

type Lang = keyof typeof CONTENT;

// ── Placeholder hero (roomski-hero.png eklenince kaldır) ─────────────────────
function HeroPlaceholder() {
  return (
    <LinearGradient
      colors={['#E0F7FA', '#FCE4EC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[st.hero, { justifyContent: 'center', alignItems: 'center' }]}
    >
      {/* Dekoratif bubbles */}
      <View style={st.bubbleWrap} pointerEvents="none">
        <View style={[st.bubble, st.bubbleBlue]} />
        <View style={[st.bubble, st.bubblePink]} />
        <View style={[st.bubble, st.bubbleSmall]} />
      </View>

      {/* Chat cards */}
      <View style={st.chatCard}>
        <Text style={st.chatName}>Mia, 22 🇵🇱</Text>
        <Text style={st.chatMsg}>Hey! Are you still looking for a roommate?</Text>
        <View style={st.matchPill}>
          <Text style={st.matchPillTxt}>✦ 94% match</Text>
        </View>
      </View>

      <View style={[st.chatCard, st.chatCardRight]}>
        <Text style={st.chatName}>Bartek, 23 🇵🇱</Text>
        <Text style={st.chatMsg}>Found a great place in Kraków!</Text>
        <View style={[st.matchPill, st.matchPillPink]}>
          <Text style={[st.matchPillTxt, { color: '#E91E63' }]}>📍 Kraków Stare Miasto</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

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
        {/* ── HERO IMAGE (veya placeholder) ─────────────────────────────────── */}
        {/* Hero image aktifken:
        <Image source={HERO} style={st.hero} resizeMode="cover" />
        */}
        <HeroPlaceholder />

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

  // Placeholder decorations
  bubbleWrap:  { ...StyleSheet.absoluteFillObject },
  bubble:      { position: 'absolute', borderRadius: 999, opacity: 0.35 },
  bubbleBlue:  { width: 220, height: 220, backgroundColor: '#00BCD4', top: -60, right: -60 },
  bubblePink:  { width: 180, height: 180, backgroundColor: '#E91E63', bottom: -40, left: -40 },
  bubbleSmall: { width: 100, height: 100, backgroundColor: '#9C27B0', top: '40%', left: '40%' },

  // Chat cards in placeholder
  chatCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginHorizontal: 24, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  chatCardRight: { marginLeft: 48 },
  chatName:      { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  chatMsg:       { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  matchPill:     { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#E0F7FA', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  matchPillPink: { backgroundColor: '#FCE4EC' },
  matchPillTxt:  { fontSize: 11, fontWeight: '700', color: '#00BCD4' },

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
