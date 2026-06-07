import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  TextInput, Animated, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { verificationService, isVerifiedResponse } from '../api/VerificationService';
import { useTranslation } from '../i18n/translations';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Verification'> };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD',
  green: '#10B981', greenBg: '#ECFDF5', greenTx: '#059669',
  red: '#EF4444', redBg: '#FEF2F2',
};

const TIMER_SECONDS = 5 * 60; // 5 dakika

// ── Geçerli üniversite domainleri ─────────────────────────────────────────────
const VALID_SUFFIXES = ['.edu', '.ac.pl', '.edu.pl'];
const VALID_DOMAINS  = [
  'uw.edu.pl', 'uj.edu.pl', 'agh.edu.pl', 'pw.edu.pl', 'pwr.edu.pl',
  'put.poznan.pl', 'ue.poznan.pl', 'pg.edu.pl', 'umcs.pl', 'polsl.pl',
  'pk.edu.pl', 'pwr.wroc.pl', 'zut.edu.pl', 'pb.edu.pl', 'utp.edu.pl',
  'umk.pl', 'ur.edu.pl', 'uwm.edu.pl', 'ujk.edu.pl', 'pcz.pl',
  'uni.opole.pl', 'amg.gda.pl', 'am.gdynia.pl', 'uzg.pl', 'uz.zgora.pl',
  'poznan.pl', 'ue.wroc.pl', 'wsiz.edu.pl',
];

function isUniversityEmail(email: string): boolean {
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  if (VALID_SUFFIXES.some(s => domain.endsWith(s))) return true;
  if (VALID_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) return true;
  return false;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return local.slice(0, 2) + '***@' + domain;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

type Phase = 'email' | 'code' | 'success';

// ── Component ─────────────────────────────────────────────────────────────────
export default function VerificationScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setVerified  = useAppStore(s => s.setVerified);
  const storeProfile = useAppStore(s => s.profile);

  // Pre-fill email from profile
  const [email, setEmail] = useState(storeProfile?.email ?? '');
  const [code,  setCode]  = useState('');
  const [phase, setPhase] = useState<Phase>('email');
  const [error, setError] = useState('');

  const [sendingCode,   setSendingCode]   = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // ── 5-minute countdown ────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Animations ────────────────────────────────────────────────────────────
  const codeInputRef = useRef<TextInput>(null);
  const successScale = useRef(new Animated.Value(0)).current;
  const successAlpha = useRef(new Animated.Value(0)).current;
  const fadeAnim     = useRef(new Animated.Value(1)).current;

  const crossFade = (next: Phase) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setPhase(next);
      setError('');
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (phase === 'code') setTimeout(() => codeInputRef.current?.focus(), 300);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'success') return;
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(successAlpha, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => { setVerified(true); navigation.goBack(); }, 2400);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────
  const emailValid   = isUniversityEmail(email);
  const emailInvalid = email.length > 6 && !emailValid;
  const canResend    = timeLeft === 0 && phase === 'code';

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!emailValid || sendingCode) return;
    setSendingCode(true);
    setError('');
    try {
      await verificationService.sendCode(email);
      startTimer();
      crossFade('code');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail  ??
        err?.message ??
        t('verification.sendFailed');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6 || verifyingCode) return;
    setVerifyingCode(true);
    setError('');
    try {
      const res = await verificationService.confirmCode(email, code);
      if (isVerifiedResponse(res)) {
        if (timerRef.current) clearInterval(timerRef.current);
        crossFade('success');
      } else {
        setError(t('verification.codeInvalid'));
        setCode('');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail  ??
        err?.message ??
        t('verification.verifyFailed');
      setError(Array.isArray(msg) ? msg[0] : msg);
      setCode('');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || sendingCode) return;
    setSendingCode(true);
    setError('');
    setCode('');
    try {
      await verificationService.sendCode(email);
      startTimer();
    } catch {
      setError(t('verification.sendFailed'));
    } finally {
      setSendingCode(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>
          {phase === 'email' ? t('verification.studentTitle')
          : phase === 'code'  ? t('verification.enterCodeTitle')
          : t('verification.title')}
        </Text>
        <View style={st.hBtn} />
      </View>

      <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={st.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* ── PHASE: email ── */}
            {phase === 'email' && (
              <View style={st.body}>
                <View style={st.iconCircle}>
                  <Text style={st.iconEmoji}>🎓</Text>
                </View>

                <Text style={st.heading}>{t('verification.emailHeading')}</Text>
                <Text style={st.subtext}>{t('verification.emailDesc')}</Text>

                <View style={[
                  st.inputWrap,
                  emailValid   && st.inputWrapValid,
                  emailInvalid && st.inputWrapInvalid,
                ]}>
                  <Text style={st.inputIcon}>✉️</Text>
                  <TextInput
                    style={st.input}
                    placeholder="john@ue.poznan.pl"
                    placeholderTextColor={C.mute}
                    value={email}
                    onChangeText={t => { setEmail(t.toLowerCase().trim()); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                  {emailValid   && <Text style={st.validIcon}>✓</Text>}
                  {emailInvalid && <Text style={st.invalidIcon}>✕</Text>}
                </View>

                {emailInvalid && (
                  <View style={st.errorBanner}>
                    <Text style={st.errorTxt}>{t('verification.emailInvalidHint')}</Text>
                  </View>
                )}
                {emailValid && (
                  <View style={st.successBanner}>
                    <Text style={st.successBannerTxt}>✓ {t('verification.emailValidMsg')}</Text>
                  </View>
                )}
                {error ? (
                  <View style={st.errorBanner}>
                    <Text style={st.errorTxt}>{error}</Text>
                  </View>
                ) : null}

                <View style={st.domainHint}>
                  <Text style={st.domainHintLabel}>{t('verification.acceptedDomains')}</Text>
                  <View style={st.domainChips}>
                    {['.edu', '.ac.pl', '.edu.pl', 'uj.edu.pl', 'put.poznan.pl', '...'].map(d => (
                      <View key={d} style={st.domainChip}>
                        <Text style={st.domainChipTxt}>{d}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ── PHASE: code ── */}
            {phase === 'code' && (
              <View style={st.body}>
                <View style={[st.iconCircle, st.iconCircleTeal]}>
                  <Text style={st.iconEmoji}>📬</Text>
                </View>

                <Text style={st.heading}>{t('verification.checkEmailTitle')}</Text>
                <Text style={st.subtext}>
                  <Text style={st.subtextBold}>{maskEmail(email)}</Text>
                  {' '}{t('verification.codeSentTo')}
                </Text>

                {/* Code boxes */}
                <TouchableOpacity
                  onPress={() => codeInputRef.current?.focus()}
                  activeOpacity={1}
                  style={st.codeWrap}
                >
                  <View style={st.codeRow}>
                    {[0,1,2,3,4,5].map(i => (
                      <View
                        key={i}
                        style={[
                          st.codeBox,
                          code.length === i && st.codeBoxCurrent,
                          code[i]          && st.codeBoxFilled,
                        ]}
                      >
                        <Text style={st.codeChar}>{code[i] ?? ''}</Text>
                      </View>
                    ))}
                  </View>
                  <TextInput
                    ref={codeInputRef}
                    value={code}
                    onChangeText={t => { setCode(t.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    maxLength={6}
                    keyboardType="number-pad"
                    style={st.hiddenInput}
                    onSubmitEditing={handleVerify}
                  />
                </TouchableOpacity>

                {error ? (
                  <View style={st.errorBanner}>
                    <Text style={st.errorTxt}>{error}</Text>
                  </View>
                ) : null}

                {/* Timer + Resend */}
                <View style={st.resendRow}>
                  {timeLeft > 0 ? (
                    <>
                      <Text style={st.timerLabel}>{t('verification.codeExpiry')} </Text>
                      <View style={[st.timerPill, timeLeft < 60 && st.timerPillWarn]}>
                        <Text style={[st.timerTxt, timeLeft < 60 && st.timerTxtWarn]}>
                          {formatTime(timeLeft)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResend}
                      disabled={sendingCode}
                      activeOpacity={0.7}
                      style={st.resendBtn}
                    >
                      {sendingCode
                        ? <ActivityIndicator size="small" color={C.brandA} />
                        : <Text style={st.resendTxt}>{t('verification.resend')} →</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* ── PHASE: success ── */}
            {phase === 'success' && (
              <Animated.View style={[st.successBody, { opacity: successAlpha }]}>
                <Animated.View style={[st.successCircle, { transform: [{ scale: successScale }] }]}>
                  <Text style={st.successIcon}>✓</Text>
                </Animated.View>
                <Text style={st.successTitle}>{t('verification.successTitle')}</Text>
                <Text style={st.successSub}>{t('verification.successDesc')}</Text>
                <View style={st.successBadgePreview}>
                  <View style={st.badgePreviewCircle}>
                    <Text style={st.badgePreviewTxt}>
                      {(storeProfile?.name ?? 'M').charAt(0).toUpperCase()}
                    </Text>
                    <View style={st.badgePreviewCheck}>
                      <Text style={st.badgePreviewCheckTxt}>✓</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={st.badgePreviewName}>{storeProfile?.name ?? t('profile.title')}</Text>
                    <View style={st.verifiedChipSmall}>
                      <Text style={st.verifiedChipTxt}>✓ {t('verification.verifiedStudent')}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

          </Animated.View>
        </ScrollView>

        {/* ── Footer button ── */}
        {phase !== 'success' && (
          <View style={st.footer}>
            {phase === 'email' && (
              <TouchableOpacity
                style={[st.cta, (!emailValid || sendingCode) && st.ctaOff]}
                onPress={handleSend}
                disabled={!emailValid || sendingCode}
                activeOpacity={0.85}
              >
                {sendingCode
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[st.ctaTxt, !emailValid && st.ctaTxtOff]}>
                      {emailValid ? t('verification.sendCode') + ' →' : t('errors.invalidEmail')}
                    </Text>}
              </TouchableOpacity>
            )}
            {phase === 'code' && (
              <TouchableOpacity
                style={[st.cta, (code.length < 6 || verifyingCode) && st.ctaOff]}
                onPress={handleVerify}
                disabled={code.length < 6 || verifyingCode}
                activeOpacity={0.85}
              >
                {verifyingCode
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[st.ctaTxt, code.length < 6 && st.ctaTxtOff]}>
                      {code.length < 6 ? t('verification.digitsRemaining').replace('{count}', String(6 - code.length)) : t('verification.verify') + ' ✓'}
                    </Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn:    { width: 38, height: 38, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  hBtnTxt: { color: C.ink, fontSize: 17 },
  hTitle:  { color: C.ink, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  scrollContent: { paddingHorizontal: 22, paddingTop: 32, paddingBottom: 20 },
  body:          { alignItems: 'center' },

  iconCircle: {
    width: 88, height: 88, borderRadius: 999, backgroundColor: '#FFF7E6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  iconCircleTeal: { backgroundColor: C.tealBg, shadowColor: C.brandA },
  iconEmoji:      { fontSize: 40 },

  heading:     { color: C.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center', marginBottom: 12 },
  subtext:     { color: C.soft, fontSize: 14.5, lineHeight: 24, textAlign: 'center', marginBottom: 28, maxWidth: 300 },
  subtextBold: { color: C.ink, fontWeight: '700' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%', backgroundColor: C.bgSoft,
    borderRadius: 16, borderWidth: 1.5, borderColor: C.line,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
  },
  inputWrapValid:   { borderColor: C.green, backgroundColor: C.greenBg },
  inputWrapInvalid: { borderColor: C.red,   backgroundColor: C.redBg   },
  inputIcon:    { fontSize: 16 },
  input:        { flex: 1, color: C.ink, fontSize: 15 },
  validIcon:    { color: C.green, fontSize: 16, fontWeight: '800' },
  invalidIcon:  { color: C.red,   fontSize: 16, fontWeight: '800' },

  successBanner:    { width: '100%', backgroundColor: C.greenBg, borderRadius: 10, borderWidth: 1, borderColor: C.green + '55', paddingVertical: 8, paddingHorizontal: 14, marginBottom: 16 },
  successBannerTxt: { color: C.greenTx, fontSize: 13, fontWeight: '600' },
  errorBanner:      { width: '100%', backgroundColor: C.redBg,   borderRadius: 10, borderWidth: 1, borderColor: C.red   + '44', paddingVertical: 8, paddingHorizontal: 14, marginBottom: 16 },
  errorTxt:         { color: C.red, fontSize: 13 },

  domainHint:      { width: '100%', marginTop: 4 },
  domainHintLabel: { color: C.mute, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  domainChips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  domainChip:      { backgroundColor: C.bgSoft, borderRadius: 8, borderWidth: 1, borderColor: C.line, paddingVertical: 3, paddingHorizontal: 8 },
  domainChipTxt:   { color: C.mute, fontSize: 11, fontFamily: 'monospace' as any },

  // Code input
  codeWrap: { width: '100%', alignItems: 'center', marginBottom: 16, position: 'relative' },
  codeRow:  { flexDirection: 'row', gap: 10 },
  codeBox:  { width: 44, height: 54, borderRadius: 14, borderWidth: 2, borderColor: C.line, backgroundColor: C.bgSoft, alignItems: 'center', justifyContent: 'center' },
  codeBoxCurrent: { borderColor: C.brandA, backgroundColor: C.tealBg },
  codeBoxFilled:  { borderColor: C.ink, backgroundColor: C.bg },
  codeChar:    { color: C.ink, fontSize: 22, fontWeight: '800' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  // Timer + resend
  resendRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  timerLabel:    { color: C.mute, fontSize: 13 },
  timerPill:     { backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  timerPillWarn: { backgroundColor: '#FFF7E6' },
  timerTxt:      { color: C.tealTx, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] as any },
  timerTxtWarn:  { color: '#D97706' },
  resendBtn:     { minHeight: 28, justifyContent: 'center' },
  resendTxt:     { color: C.brandA, fontSize: 13, fontWeight: '600' },

  // Success
  successBody: { alignItems: 'center', paddingTop: 20 },
  successCircle: {
    width: 100, height: 100, borderRadius: 999, backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: C.green, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 10,
  },
  successIcon:  { color: '#fff', fontSize: 46, fontWeight: '800', lineHeight: 54 },
  successTitle: { color: C.ink, fontSize: 26, fontWeight: '800', marginBottom: 10, letterSpacing: -0.4 },
  successSub:   { color: C.soft, fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 32, maxWidth: 280 },
  successBadgePreview: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.bgSoft, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 14,
  },
  badgePreviewCircle: { width: 52, height: 52, borderRadius: 999, backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badgePreviewTxt:      { color: '#fff', fontSize: 20, fontWeight: '800' },
  badgePreviewCheck:    { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 999, backgroundColor: C.green, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  badgePreviewCheckTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  badgePreviewName:     { color: C.ink, fontSize: 15, fontWeight: '700' },
  verifiedChipSmall:    { backgroundColor: C.greenBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, marginTop: 4, borderWidth: 1, borderColor: C.green + '55' },
  verifiedChipTxt:      { color: C.greenTx, fontSize: 11, fontWeight: '700' },

  // Footer
  footer: { paddingHorizontal: 22, paddingBottom: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  cta:    { backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 18, alignItems: 'center', shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 },
  ctaOff: { backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line, shadowOpacity: 0, elevation: 0 },
  ctaTxt:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaTxtOff: { color: C.mute },
});
