// src/screens/OnboardingScreen.tsx — Splash / Welcome (Claude Design)
//
// Complete redesign: Gradient panel + chat bubbles + medallion logo
// Shows on first launch (onboarded flag not set)
// User taps "Get started" → RegisterScreen
// User taps "I have account" → LoginScreen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar, Dimensions, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { COLORS, GRADIENT, SHADOW, RADII, SPACING } from '../utils/constants';
import { Logo } from '../components/Logo';
import { Pill } from '../components/Pill';
import { useT, setLanguage, Lang } from '../i18n/translations';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function Bubble({
  text,
  gradient,
  x,
  y,
  rotate = 0,
  tail = 'l',
}: {
  text: string;
  gradient: readonly [string, string];
  x: number;
  y: number;
  rotate?: number;
  tail?: 'l' | 'r';
}) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: [{ rotate: `${rotate}deg` }],
        ...SHADOW.card,
      }}>
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 18,
          borderBottomLeftRadius: tail === 'l' ? 6 : 18,
          borderBottomRightRadius: tail === 'r' ? 6 : 18,
        }}>
        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 13,
            letterSpacing: -0.2,
          }}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
}

// ─── Language Picker ──────────────────────────────────────────────────────────
function LangSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  const opts: { code: Lang; flag: string; name: string }[] = [
    { code: 'tr', flag: '🇹🇷', name: 'TR' },
    { code: 'pl', flag: '🇵🇱', name: 'PL' },
    { code: 'en', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'EN' },
  ];

  return (
    <View style={s.langWrap}>
      {opts.map((o) => {
        const on = o.code === lang;
        return (
          <Pressable
            key={o.code}
            onPress={() => onChange(o.code)}
            style={[s.langItem, on && s.langItemOn]}>
            <Text style={{ fontSize: 14 }}>{o.flag}</Text>
            <Text style={[s.langText, on && { color: '#fff' }]}>
              {o.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Props {
  onGetStarted?: () => void; // → RegisterScreen
  onSignIn?: () => void; // → LoginScreen
  onOnboarded?: () => void; // Set @staymate/onboarded=1 in AsyncStorage
}

export default function OnboardingScreen({
  onGetStarted,
  onSignIn,
  onOnboarded,
}: Props) {
  const { t, lang } = useT();
  const heroH = SCREEN_H * 0.52;

  const handleGetStarted = async () => {
    // Mark as onboarded
    onOnboarded?.();
    // Then navigate to register
    onGetStarted?.();
  };

  const handleSignIn = async () => {
    // Mark as onboarded
    onOnboarded?.();
    // Then navigate to login
    onSignIn?.();
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background gradient — full screen, very soft */}
      <LinearGradient
        colors={['#E6F8FA', '#F0EAFB', '#FBE7F1', '#FFFFFF']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Diagonal accent panel — top wedge */}
      <Svg
        width={SCREEN_W}
        height={heroH}
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <SvgGradient
            id="wedgeGrad"
            x1="0"
            y1="0"
            x2={SCREEN_W}
            y2={heroH}
            gradientUnits="userSpaceOnUse">
            <Stop stopColor="#1FBFCC" stopOpacity="0.35" />
            <Stop offset="0.5" stopColor="#8E5CD9" stopOpacity="0.28" />
            <Stop offset="1" stopColor="#D93B8B" stopOpacity="0.22" />
          </SvgGradient>
        </Defs>
        <Polygon
          points={`0,0 ${SCREEN_W},0 ${SCREEN_W},${heroH * 0.78} 0,${heroH}`}
          fill="url(#wedgeGrad)"
        />
        <Polygon
          points={`0,${heroH * 0.18} ${SCREEN_W},0 ${SCREEN_W},${heroH * 0.55} 0,${heroH * 0.85}`}
          fill="rgba(255,255,255,0.35)"
        />
      </Svg>

      {/* Soft float blobs */}
      <View
        pointerEvents="none"
        style={[
          s.blob,
          {
            left: -60,
            top: 40,
            backgroundColor: '#FFC4DF',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          s.blob,
          {
            right: -60,
            top: 100,
            backgroundColor: '#C9A8FF',
            width: 220,
            height: 220,
          },
        ]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Hero zone — chat bubbles + medallion */}
        <View style={{ height: heroH, position: 'relative' }}>
          <Bubble
            text={t('splash_tagline')}
            gradient={['#00CFC8', '#FF9ACD'] as const}
            x={24}
            y={70}
            rotate={-4}
            tail="l"
          />
          <Bubble
            text="UAM · Poznań 🎓"
            gradient={['#8E5CD9', '#D93B8B'] as const}
            x={SCREEN_W - 180}
            y={140}
            rotate={3}
            tail="r"
          />
          <Bubble
            text="vegan · gece kuşu 🦉"
            gradient={['#00CFC8', '#8E5CD9'] as const}
            x={36}
            y={210}
            rotate={-2}
            tail="l"
          />
          <Bubble
            text="sessiz · temiz 🤫"
            gradient={['#D93B8B', '#FF9ACD'] as const}
            x={SCREEN_W - 200}
            y={260}
            rotate={4}
            tail="r"
          />

          {/* Medallion — sits on the split line */}
          <View style={[s.medallion, { top: heroH - 60 }]}>
            <LinearGradient
              colors={GRADIENT.brand as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.medallionRing}>
              <View style={s.medallionInner}>
                <Logo size={56} />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom content — scrollable */}
        <ScrollView
          contentContainerStyle={s.bottomContent}
          showsVerticalScrollIndicator={false}>
          <Text style={s.wordmark}>Roomski</Text>
          <Text style={s.tagline}>{t('splash_tagline')}</Text>
          <Text style={s.subtitle}>{t('splash_subtitle')}</Text>

          <View style={{ height: 24 }} />

          <Pill
            variant="grad"
            size="lg"
            block
            glow
            onPress={handleGetStarted}>
            {t('splash_cta')}
          </Pill>
          <View style={{ height: 12 }} />
          <Pressable onPress={handleSignIn} style={s.signinBtn}>
            <Text style={s.signinText}>{t('splash_signin')}</Text>
          </Pressable>

          <View style={{ height: 24 }} />

          <LangSwitcher lang={lang} onChange={setLanguage} />
          <Text style={s.terms}>{t('splash_terms')}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    opacity: 0.35,
  },

  medallion: {
    position: 'absolute',
    left: '50%',
    marginLeft: -56,
  },
  medallionRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.float,
  },
  medallionInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  wordmark: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -1.2,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.soft,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  signinBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  signinText: {
    color: COLORS.soft,
    fontWeight: '600',
    fontSize: 14,
  },

  langWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    ...SHADOW.card,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  langItemOn: {
    backgroundColor: COLORS.ink,
  },
  langText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.soft,
  },

  terms: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
    lineHeight: 16,
  },
});
