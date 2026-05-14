import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

// ── Design tokens — light mode (mobile-ui.jsx T.L) ────────────────────────────
const C = {
  bg:     '#FFFFFF',
  bgSoft: '#FAFAFA',
  card:   '#FFFFFF',
  ink:    '#1F2937',
  soft:   '#4B5563',
  mute:   '#9CA3AF',
  line:   'rgba(31,41,55,0.08)',
  brandA: '#00CFC8',   // teal
  brandB: '#FF9ACD',   // pink
  tealDim:'rgba(0,207,200,0.10)',
  pinkDim:'rgba(255,154,205,0.12)',
};

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Aurora blobs ── */}
      <View style={[st.blob, st.blobTL]} />
      <View style={[st.blob, st.blobBR]} />
      <View style={[st.blob, st.blobMid]} />

      {/* ── Logo satırı ── */}
      <View style={st.logoRow}>
        <View style={st.logoMark}>
          <Text style={st.logoMarkTxt}>s</Text>
        </View>
        <Text style={st.logoTxt}>staymate</Text>
        <View style={st.betaBadge}>
          <Text style={st.betaTxt}>BETA</Text>
        </View>
      </View>

      {/* ── Yüzen profil kartları ── */}
      <View style={st.cardsArea}>
        {/* Sol kart */}
        <View style={[st.floatCard, st.cardLeft]}>
          <View style={[st.cardPhoto, st.photoRose]}>
            <View style={st.matchBadge}>
              <Text style={st.matchBadgeTxt}>96% match</Text>
            </View>
          </View>
          <Text style={st.cardName}>Zofia, 24</Text>
          <Text style={st.cardSub}>Mokotów · plant-mom</Text>
          <View style={st.tagRow}>
            <View style={[st.tagChip, { backgroundColor: '#FFE0EF' }]}>
              <Text style={st.tagEmoji}>🌿</Text>
            </View>
            <View style={[st.tagChip, { backgroundColor: '#E6FBFA' }]}>
              <Text style={st.tagEmoji}>☕</Text>
            </View>
          </View>
        </View>

        {/* Sağ kart */}
        <View style={[st.floatCard, st.cardRight]}>
          <View style={[st.cardPhoto, st.cardPhotoTall, st.photoTeal]}>
            <View style={st.matchBadge}>
              <Text style={st.matchBadgeTxt}>92% match</Text>
            </View>
          </View>
          <Text style={st.cardName}>Kasia, 27</Text>
          <Text style={st.cardSub}>Kazimierz · soft jazz</Text>
          <View style={st.tagRow}>
            <View style={[st.tagChip, { backgroundColor: '#E6FBFA' }]}>
              <Text style={st.tagEmoji}>🎵</Text>
            </View>
          </View>
        </View>

        {/* Online pill */}
        <View style={st.onlinePill}>
          <View style={st.onlineDot} />
          <Text style={st.onlineTxt}>128 yeni bu hafta</Text>
        </View>
      </View>

      {/* ── Alt içerik ── */}
      <View style={st.bottom}>
        {/* Eyebrow chip */}
        <View style={st.eyebrowChip}>
          <Text style={st.eyebrow}>YENİ · İlkbahar '26</Text>
        </View>

        <Text style={st.headline}>{'Hayalindeki\nEv Arkadaşını\nBul.'}</Text>
        <Text style={st.sub}>
          Vibe'a göre eşleştir, depozito korumalı, drama yok.
        </Text>

        {/* CTA — teal pill */}
        <TouchableOpacity
          style={st.cta}
          onPress={() => navigation.navigate('Quiz')}
          activeOpacity={0.85}
        >
          <Text style={st.ctaTxt}>Başla</Text>
          <Text style={st.ctaArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.signInBtn} activeOpacity={0.7}>
          <Text style={st.signInTxt}>
            Zaten hesabın var mı?{'  '}
            <Text style={st.signInLink}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },

  // Aurora blobs — light modda çok hafif
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTL: {
    width: 340,
    height: 340,
    backgroundColor: C.brandA,
    top: -100,
    left: -110,
    opacity: 0.18,
  },
  blobBR: {
    width: 340,
    height: 340,
    backgroundColor: C.brandB,
    bottom: -100,
    right: -110,
    opacity: 0.18,
  },
  blobMid: {
    width: 200,
    height: 200,
    backgroundColor: C.brandB,
    top: '36%',
    left: '16%',
    opacity: 0.1,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
    gap: 8,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: C.brandA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  logoTxt: {
    color: C.ink,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  betaBadge: {
    backgroundColor: C.bgSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.line,
  },
  betaTxt: {
    color: C.mute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Floating cards
  cardsArea: {
    height: 280,
    marginTop: 24,
    marginHorizontal: 22,
    position: 'relative',
  },
  floatCard: {
    position: 'absolute',
    width: 158,
    backgroundColor: C.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
  },
  cardLeft: {
    top: 22,
    left: 0,
    transform: [{ rotate: '-7deg' }],
    shadowColor: C.brandA,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  cardRight: {
    top: 2,
    right: 0,
    transform: [{ rotate: '6deg' }],
    shadowColor: C.brandB,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 10,
  },
  cardPhoto: {
    height: 120,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 8,
  },
  cardPhotoTall: {
    height: 140,
  },
  photoRose: {
    // diagonal stripe tint — rose
    backgroundColor: '#FFE0EF',
  },
  photoTeal: {
    backgroundColor: '#E6FBFA',
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchBadgeTxt: {
    color: '#00A8A2',
    fontSize: 10,
    fontWeight: '700',
  },
  cardName: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: -0.2,
  },
  cardSub: {
    color: C.mute,
    fontSize: 11,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 7,
  },
  tagChip: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagEmoji: {
    fontSize: 11,
  },

  // Online pill
  onlinePill: {
    position: 'absolute',
    bottom: 6,
    left: '28%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 7,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: C.brandA,
  },
  onlineTxt: {
    color: C.soft,
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom
  bottom: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
    justifyContent: 'flex-end',
  },
  eyebrowChip: {
    alignSelf: 'flex-start',
    backgroundColor: C.bgSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  eyebrow: {
    color: C.mute,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  headline: {
    color: C.ink,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 43,
    marginBottom: 12,
  },
  sub: {
    color: C.soft,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 26,
  },

  // CTA
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.brandA,
    borderRadius: 999,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: C.brandA,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Sign-in
  signInBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  signInTxt: {
    color: C.mute,
    fontSize: 13,
    fontWeight: '500',
  },
  signInLink: {
    color: C.brandA,
    fontWeight: '600',
  },
});
