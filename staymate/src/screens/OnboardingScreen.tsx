// src/screens/OnboardingScreen.tsx — roomski splash
//
// Layout: two diagonal gradient panels (SVG), white chat bubbles with
// timestamps + read ticks, Kraków/Wrocław location pills, gradient
// medallion on the split line, "roomski" wordmark, gradient CTA,
// PL/TR/EN pill language switcher.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Polygon, Defs,
  LinearGradient as SvgGrad, Stop,
} from 'react-native-svg';
import { COLORS, GRADIENT, SHADOW } from '../utils/constants';
import { Logo }  from '../components/Logo';
import { Pill }  from '../components/Pill';
import { useT, setLanguage, Lang } from '../i18n/translations';

const { width: W, height: H } = Dimensions.get('window');

// Diagonal split: wider at top, narrower at bottom
const HERO_H       = H * 0.50;
const SPLIT_TOP    = W * 0.54;
const SPLIT_BOTTOM = W * 0.46;

// ─── Two diagonal gradient panels ────────────────────────────────────────────
function HeroPanels() {
  return (
    <Svg
      width={W}
      height={HERO_H}
      style={StyleSheet.absoluteFillObject}>
      <Defs>
        {/* Left: teal → violet */}
        <SvgGrad
          id="lg"
          x1={0}
          y1={0}
          x2={SPLIT_TOP}
          y2={HERO_H}
          gradientUnits="userSpaceOnUse">
          <Stop offset="0"   stopColor="#1FBFCC" />
          <Stop offset="1"   stopColor="#8E5CD9" />
        </SvgGrad>
        {/* Right: violet → magenta */}
        <SvgGrad
          id="rg"
          x1={W}
          y1={0}
          x2={SPLIT_BOTTOM}
          y2={HERO_H}
          gradientUnits="userSpaceOnUse">
          <Stop offset="0"   stopColor="#8E5CD9" />
          <Stop offset="1"   stopColor="#D93B8B" />
        </SvgGrad>
        {/* Bottom fade to white */}
        <SvgGrad
          id="fo"
          x1={0}
          y1={HERO_H * 0.55}
          x2={0}
          y2={HERO_H}
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#fff" stopOpacity="0" />
          <Stop offset="1" stopColor="#fff" stopOpacity="1"  />
        </SvgGrad>
      </Defs>

      {/* Left panel */}
      <Polygon
        points={`0,0 ${SPLIT_TOP},0 ${SPLIT_BOTTOM},${HERO_H} 0,${HERO_H}`}
        fill="url(#lg)"
      />
      {/* Right panel */}
      <Polygon
        points={`${SPLIT_TOP},0 ${W},0 ${W},${HERO_H} ${SPLIT_BOTTOM},${HERO_H}`}
        fill="url(#rg)"
      />
      {/* Fade overlay */}
      <Polygon
        points={`0,${HERO_H * 0.5} ${W},${HERO_H * 0.5} ${W},${HERO_H} 0,${HERO_H}`}
        fill="url(#fo)"
      />
    </Svg>
  );
}

// ─── White chat bubble with timestamp + read ticks ───────────────────────────
function WhiteBubble({
  text, time, x, y, rotate = 0, tail = 'l',
}: {
  text: string; time: string;
  x: number; y: number;
  rotate?: number; tail?: 'l' | 'r';
}) {
  return (
    <View
      style={[
        b.wrap,
        {
          left: x,
          top:  y,
          transform: [{ rotate: `${rotate}deg` }],
        },
      ]}>
      <View
        style={[
          b.bubble,
          {
            borderBottomLeftRadius:  tail === 'l' ? 4 : 18,
            borderBottomRightRadius: tail === 'r' ? 4 : 18,
          },
        ]}>
        <Text style={b.text}>{text}</Text>
        <View style={b.footer}>
          <Text style={b.time}>{time}</Text>
          <Text style={b.ticks}>✓✓</Text>
        </View>
      </View>
    </View>
  );
}

const b = StyleSheet.create({
  wrap:   {
    position: 'absolute',
    ...SHADOW.card,
  },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 18,
    minWidth: 150,
    maxWidth: W * 0.52,
  },
  text: {
    color: COLORS.ink,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  time:  { color: COLORS.muted, fontSize: 10 },
  ticks: { color: '#1FBFCC', fontSize: 10, fontWeight: '800' },
});

// ─── Location pill ────────────────────────────────────────────────────────────
function LocationPill({
  city, color, x, y,
}: {
  city: string; color: string;
  x: number;    y: number;
}) {
  return (
    <View
      style={[
        lp.wrap,
        { left: x, top: y, borderColor: color + '55' },
      ]}>
      <Text style={lp.pin}>📍</Text>
      <Text style={[lp.city, { color }]}>{city}</Text>
    </View>
  );
}

const lp = StyleSheet.create({
  wrap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    ...SHADOW.card,
  },
  pin:  { fontSize: 12 },
  city: { fontWeight: '700', fontSize: 13, letterSpacing: -0.2 },
});

// ─── Language switcher ────────────────────────────────────────────────────────
function LangSwitcher({
  lang, onChange,
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
    <View style={s.langRow}>
      {opts.map((o) => {
        const on = o.code === lang;
        return (
          <Pressable
            key={o.code}
            onPress={() => onChange(o.code)}
            style={[s.langPill, on && s.langPillOn]}
            hitSlop={6}>
            <Text style={{ fontSize: 14 }}>{o.flag}</Text>
            <Text style={[s.langTxt, on && { color: '#fff' }]}>
              {o.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
interface Props {
  onGetStarted?: () => void;
  onSignIn?:     () => void;
  onOnboarded?:  () => void;
}

export default function OnboardingScreen({
  onGetStarted,
  onSignIn,
  onOnboarded,
}: Props) {
  const { t, lang } = useT();

  const handleGetStarted = () => { onOnboarded?.(); onGetStarted?.(); };
  const handleSignIn     = () => { onOnboarded?.(); onSignIn?.(); };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Soft full-screen pastel background */}
      <LinearGradient
        colors={['#E6F8FA', '#F0EAFB', '#FBE7F1', '#FFFFFF']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* ── Hero zone ─────────────────────────────────────────────────────── */}
        <View style={{ height: HERO_H, overflow: 'hidden' }}>
          <HeroPanels />

          {/* Bubble A — left, top */}
          <WhiteBubble
            text={t('splash_chat_a_l1')}
            time="09:41"
            x={20}
            y={72}
            rotate={-3}
            tail="l"
          />

          {/* Bubble B — right, middle */}
          <WhiteBubble
            text={t('splash_chat_b_l1')}
            time="09:42"
            x={W - 188}
            y={152}
            rotate={3}
            tail="r"
          />

          {/* Location pills */}
          <LocationPill
            city="Kraków"
            color="#1FBFCC"
            x={24}
            y={HERO_H * 0.60}
          />
          <LocationPill
            city="Wrocław"
            color="#D93B8B"
            x={W - 128}
            y={HERO_H * 0.70}
          />

          {/* Medallion — centred on the split line */}
          <View style={[s.medallion, { top: HERO_H - 56 }]}>
            <LinearGradient
              colors={GRADIENT.brand as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ring}>
              <View style={s.ringInner}>
                <Logo size={52} />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* ── Bottom content ─────────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={s.bottom}
          showsVerticalScrollIndicator={false}>

          <Text style={s.wordmark}>roomski</Text>
          <Text style={s.tagline}>{t('splash_tagline')}</Text>
          <Text style={s.subtitle}>{t('splash_subtitle')}</Text>

          <View style={{ height: 28 }} />

          <Pill variant="grad" size="lg" block glow onPress={handleGetStarted}>
            {t('splash_cta')}
          </Pill>

          <View style={{ height: 10 }} />

          <Pressable onPress={handleSignIn} style={s.signinBtn}>
            <Text style={s.signinTxt}>{t('splash_signin')}</Text>
          </Pressable>

          <View style={{ height: 28 }} />

          <LangSwitcher lang={lang} onChange={setLanguage} />

          <Text style={s.terms}>{t('splash_terms')}</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  medallion: {
    position: 'absolute',
    left: W / 2 - 54,
  },
  ring: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.float,
  },
  ringInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottom: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 32,
    alignItems: 'center',
  },

  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -1.5,
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
  signinTxt: {
    color: COLORS.soft,
    fontWeight: '600',
    fontSize: 14,
  },

  langRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    ...SHADOW.card,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  langPillOn: { backgroundColor: COLORS.ink },
  langTxt: {
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
