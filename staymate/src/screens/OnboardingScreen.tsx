import React, { useCallback, useRef } from 'react';
import {
  View, Text, Image, StyleSheet,
  Dimensions, StatusBar, Pressable, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, SHADOW, RADII } from '../utils/constants';
import { useT, setLanguage, Lang } from '../i18n/translations';

const { width: W } = Dimensions.get('window');
const DISPLAY_W = Platform.OS === 'web' ? 390 : W;
const HERO_H    = DISPLAY_W * (1080 / 718); // composite image aspect ratio

const ONBOARDED_KEY = '@roomski/onboarded';
const TIMEOUT_MS    = 30_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

export default function OnboardingScreen() {
  const { t, lang } = useT();
  const navigation  = useNavigation<any>();
  const [error, setError] = React.useState<string | null>(null);
  const guard = useRef(false);

  const mark = () =>
    withTimeout(AsyncStorage.setItem(ONBOARDED_KEY, '1'), TIMEOUT_MS);

  const go = useCallback(
    async (mode: 'register' | 'login') => {
      if (guard.current) return;
      guard.current = true;
      setError(null);
      try {
        await mark();
        navigation.replace('Auth', { mode });
      } catch (e: any) {
        setError(e?.message === 'timeout' ? 'Connection timed out.' : 'Connection error.');
        guard.current = false;
      }
    },
    [navigation],
  );

  const OPTS: Lang[] = ['pl', 'tr', 'en'];

  return (
    <View style={s.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <View style={s.heroWrap}>
        <Image
          source={require('../../assets/hero_composite.png')}
          style={s.hero}
          resizeMode="contain"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.85)', '#ffffff']}
          style={s.heroFade}
        />
      </View>
      <SafeAreaView style={s.bottom} edges={['bottom']}>

        <View style={s.logoRow}>
          <Text style={s.logoText}>roomski</Text>
        </View>

        <View style={s.spacerTop} />

        <LinearGradient
          colors={['#1FBFCC', '#8E5CD9', '#D93B8B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.btn}>
          <Pressable style={s.btnInner} onPress={() => go('register')}>
            <Text style={s.btnText}>{t('splash_cta')}</Text>
          </Pressable>
        </LinearGradient>

        {error ? (
          <Pressable style={s.signinBtn} onPress={() => { setError(null); go('register'); }}>
            <Text style={[s.signinText, { color: COLORS.error }]}>{error} Tap to retry.</Text>
          </Pressable>
        ) : (
          <Pressable style={s.signinBtn} onPress={() => go('login')}>
            <Text style={s.signinText}>{t('splash_signin')}</Text>
          </Pressable>
        )}

        <View style={s.spacerBottom} />

        <View style={s.langWrap}>
          {OPTS.map((l) => {
            const active = l === lang;
            return (
              <Pressable
                key={l}
                onPress={() => setLanguage(l)}
                style={[s.langPill, active && s.langPillOn]}>
                <Text style={[s.langText, active && s.langTextOn]}>
                  {l.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  heroWrap: {
    width: DISPLAY_W,
    height: HERO_H,
    marginTop: -52,
  },
  hero: {
    width: DISPLAY_W,
    height: HERO_H,
  },
  heroFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },

  bottom: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  logoText:    { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.8 },

  spacerTop:    { flex: 1 },
  spacerBottom: { flex: 1 },

  btn:     { alignSelf: 'stretch', borderRadius: RADII.pill, overflow: 'hidden', ...SHADOW.glow },
  btnInner:{ height: 56, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  signinBtn:  { paddingVertical: 14, alignItems: 'center' },
  signinText: { color: COLORS.muted, fontWeight: '500', fontSize: 14 },

  langWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADII.pill,
    padding: 3,
    gap: 2,
    marginBottom: 8,
  },
  langPill:    { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADII.pill, minWidth: 48, alignItems: 'center' },
  langPillOn:  { backgroundColor: COLORS.primary },
  langText:    { fontSize: 11, fontWeight: '700', color: COLORS.soft, letterSpacing: 0.5 },
  langTextOn:  { color: '#fff' },
});
