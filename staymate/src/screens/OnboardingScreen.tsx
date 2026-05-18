import React from 'react';
import {
  View, Text, ScrollView, Pressable, Dimensions, StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width, height } = Dimensions.get('window');

const TEXTS = {
  pl: {
    subtitle:          'Find your people.',
    subtitleHighlight: 'Feel at home.',
    description:       "The easiest way to find a roommate and a place you'll love.",
    cta:               'Get started',
    loginLink:         'I have an account',
  },
  tr: {
    subtitle:          'Seni anlayan insanları bul.',
    subtitleHighlight: 'Evinizi hissedin.',
    description:       'Oda arkadaşı ve yalnızca sevdiğiniz bir yer bulmanın en kolay yolu.',
    cta:               'Başla',
    loginLink:         'Hesabım var',
  },
  en: {
    subtitle:          'Find your people.',
    subtitleHighlight: 'Feel at home.',
    description:       "The easiest way to find a roommate and a place you'll love.",
    cta:               'Get started',
    loginLink:         'I have an account',
  },
} as const;

type Lang = keyof typeof TEXTS;

export default function OnboardingScreen({ navigation }: Props) {
  const { language } = useTranslation();
  const setLanguage  = useAppStore(s => s.setLanguage);

  const lang    = (language in TEXTS ? language : 'en') as Lang;
  const content = TEXTS[lang];

  return (
    <ScrollView style={st.root} scrollEnabled={false} bounces={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Diagonal split hero ─────────────────────────────────────────────── */}
      <View style={[st.hero, { height: height - 220 }]}>

        {/* Left white panel */}
        <View style={st.leftPanel} />

        {/* Right soft gradient panel */}
        <LinearGradient
          colors={['rgba(0,188,212,0.08)', 'rgba(233,30,99,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.rightPanel}
        />

        {/* Diagonal skew accent */}
        <View style={st.skewWrap} pointerEvents="none">
          <View style={[st.skew, { width: width * 0.6 }]} />
        </View>

        {/* ── LEFT: Logo + text ──────────────────────────────────────────────── */}
        <View style={st.leftContent}>
          {/* Logo mark */}
          <View style={st.logoRow}>
            <LinearGradient
              colors={['#00BCD4', '#E91E63']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={st.logoGradient}
            >
              <Text style={st.logoEmoji}>🏘️</Text>
            </LinearGradient>
            <Text style={st.logoWord}>roomski</Text>
          </View>

          {/* Headline */}
          <View style={st.headlineWrap}>
            <Text style={st.headline}>{content.subtitle}</Text>
            <Text style={[st.headline, st.headlineAccent]}>
              {content.subtitleHighlight}
            </Text>
          </View>

          {/* Description */}
          <Text style={st.description}>{content.description}</Text>
        </View>

        {/* ── RIGHT: Chat bubbles + location badge ───────────────────────────── */}
        <View style={st.rightContent} pointerEvents="none">

          {/* Location badge */}
          <View style={[st.badge, st.badgeTop]}>
            <Text style={st.badgeEmoji}>📍</Text>
            <Text style={st.badgeTxt}>Kraków</Text>
          </View>

          {/* Chat bubble — incoming */}
          <View style={[st.bubble, st.bubbleIn, st.bubbleFirst]}>
            <Text style={st.bubbleLabel}>Hey! 👋</Text>
            <Text style={st.bubbleSub}>Looking for a roommate?</Text>
            <Text style={st.bubbleTime}>10:24</Text>
          </View>

          {/* Match badge */}
          <View style={[st.badge, st.badgeMid]}>
            <Text style={st.badgeEmoji}>✦</Text>
            <Text style={[st.badgeTxt, { color: '#E91E63' }]}>92% uyum</Text>
          </View>

          {/* Chat bubble — outgoing */}
          <View style={[st.bubble, st.bubbleOut, st.bubbleSecond]}>
            <Text style={[st.bubbleSub, { color: '#555' }]}>
              Hi! 😊 Yes, looking too!
            </Text>
            <Text style={[st.bubbleTime, { textAlign: 'right' }]}>10:26 ✓✓</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom CTA section ──────────────────────────────────────────────── */}
      <View style={st.bottom}>

        {/* Gradient CTA */}
        <LinearGradient
          colors={['#00BCD4', '#E91E63']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={st.ctaGradient}
        >
          <Pressable
            onPress={() => navigation.navigate('Auth', { mode: 'register' })}
            style={st.ctaBtn}
          >
            <Text style={st.ctaTxt}>{content.cta}</Text>
          </Pressable>
        </LinearGradient>

        {/* Login link */}
        <Pressable
          onPress={() => navigation.navigate('Auth', { mode: 'login' })}
          style={st.loginBtn}
        >
          <Text style={st.loginTxt}>{content.loginLink}</Text>
        </Pressable>

        {/* Language selector */}
        <View style={st.langWrap}>
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
    </ScrollView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero:       { position: 'relative', overflow: 'hidden' },
  leftPanel:  { position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#fff' },
  rightPanel: { position: 'absolute', right: 0, top: 0, width: '50%', height: '100%' },
  skewWrap:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  skew:       { position: 'absolute', top: 0, right: 0, height: '100%', backgroundColor: 'rgba(233,30,99,0.04)', transform: [{ skewX: '-12deg' }] },

  // ── Left content ──────────────────────────────────────────────────────────
  leftContent: {
    position: 'absolute', left: 0, top: 0, width: '58%', height: '100%',
    paddingTop: 56, paddingLeft: 22, paddingRight: 12, zIndex: 4,
  },
  logoRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  logoGradient: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoEmoji:    { fontSize: 22 },
  logoWord:     { fontSize: 24, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  headlineWrap: { marginBottom: 16 },
  headline:     { fontSize: 26, fontWeight: '800', color: '#000', lineHeight: 34, letterSpacing: -0.4 },
  headlineAccent: { color: '#E91E63' },
  description:  { fontSize: 13, color: '#999', lineHeight: 20 },

  // ── Right content ─────────────────────────────────────────────────────────
  rightContent: {
    position: 'absolute', right: 0, top: 0, width: '46%', height: '100%',
    paddingTop: 40, paddingRight: 12, zIndex: 4,
  },

  // Badges
  badge:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  badgeTop:  { marginBottom: 14, marginTop: 10 },
  badgeMid:  { marginTop: 10, marginBottom: 10 },
  badgeEmoji:{ fontSize: 13 },
  badgeTxt:  { fontSize: 12, fontWeight: '700', color: '#1F2937', marginLeft: 4 },

  // Bubbles
  bubble:       { borderRadius: 12, padding: 10, maxWidth: 180, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  bubbleIn:     { backgroundColor: '#fff', alignSelf: 'flex-start' },
  bubbleOut:    { backgroundColor: '#F0F0F0', alignSelf: 'flex-end' },
  bubbleFirst:  {},
  bubbleSecond: {},
  bubbleLabel:  { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 3 },
  bubbleSub:    { fontSize: 12, color: '#666' },
  bubbleTime:   { fontSize: 10, color: '#ccc', marginTop: 4 },

  // ── Bottom ────────────────────────────────────────────────────────────────
  bottom:      { paddingHorizontal: 24, paddingVertical: 28, backgroundColor: '#fff' },
  ctaGradient: { borderRadius: 28, marginBottom: 14 },
  ctaBtn:      { paddingVertical: 17, alignItems: 'center' },
  ctaTxt:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  loginBtn:    { paddingVertical: 12, alignItems: 'center', marginBottom: 24 },
  loginTxt:    { color: '#999', fontSize: 14, fontWeight: '500' },
  langWrap:    { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  langBtn:     { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 16, backgroundColor: '#F3F4F6' },
  langBtnActive:{ backgroundColor: '#00BCD4' },
  langTxt:     { fontSize: 12, fontWeight: '500', color: '#666' },
  langTxtActive:{ color: '#fff', fontWeight: '700' },
});
