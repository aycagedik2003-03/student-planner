import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { verificationService } from '../api/VerificationService';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n/translations';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmailVerification'>;
  route:      RouteProp<RootStackParamList, 'EmailVerification'>;
};

const RESEND_SECONDS  = 60;
const MAX_RESEND      = 3;
const CODE_LEN        = 6;

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const email    = route.params?.email ?? '';
  const userType = useAppStore(s => s.userType);
  const { t }    = useTranslation();

  // ── Code state ────────────────────────────────────────────────────────────
  const [digits,      setDigits]      = useState<string[]>(Array(CODE_LEN).fill(''));
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [timer,       setTimer]       = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [focused,     setFocused]     = useState<number | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LEN).fill(null));

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDigit = (text: string, idx: number) => {
    if (!/^[0-9]?$/.test(text)) return;          // numbers only
    const next = [...digits];
    next[idx] = text;
    setDigits(next);
    setError('');

    if (text && idx < CODE_LEN - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    // Auto-submit when last digit filled
    if (text && idx === CODE_LEN - 1 && next.every(d => d)) {
      setTimeout(() => doVerify(next), 80);
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const doVerify = useCallback(async (code: string[] = digits) => {
    const str = code.join('');
    if (str.length < CODE_LEN) {
      setError(t('verification.enterSixDigit'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await verificationService.verifyEmail(str);
      if (__DEV__) console.log('[EmailVerification] verified:', res);

      const ok = res.verified === true || res.isVerified === true
              || res.success === true  || !!res.access_token;

      if (ok) {
        setSuccess(t('verification.verified'));
        setTimeout(() => {
          if (userType === 'landlord') navigation.replace('LandlordTabs');
          else                         navigation.replace('Quiz');
        }, 1200);
      } else {
        setError(t('verification.codeInvalid'));
        setDigits(Array(CODE_LEN).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      if (__DEV__) console.warn('[EmailVerification] error:', err.response?.data ?? err.message);
      const msg = err.response?.data?.detail || err.response?.data?.message
               || t('verification.verifyFailed');
      setError(Array.isArray(msg) ? msg[0] : msg);
      setDigits(Array(CODE_LEN).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [digits, userType, navigation, t]);

  const handleResend = useCallback(async () => {
    if (resendCount >= MAX_RESEND) {
      setError(t('verification.maxResend'));
      return;
    }
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await verificationService.resendCode(email);
      if (__DEV__) console.log('[EmailVerification] code resent to', email);
      const next = resendCount + 1;
      setResendCount(next);
      setTimer(RESEND_SECONDS);
      setDigits(Array(CODE_LEN).fill(''));
      setSuccess(t('verification.codeSentNew'));
      setTimeout(() => setSuccess(''), 3000);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      if (__DEV__) console.warn('[EmailVerification] resend error:', err.response?.data ?? err.message);
      const msg = err.response?.data?.detail || err.response?.data?.message
               || t('verification.sendFailed');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setResending(false);
    }
  }, [email, resendCount, t]);

  const handleSkip = () => {
    if (userType === 'landlord') navigation.replace('LandlordTabs');
    else                         navigation.replace('Quiz');
  };

  const canResend  = timer <= 0 && resendCount < MAX_RESEND && !resending;
  const codeReady  = digits.every(d => d.length === 1);
  const busy       = loading || resending || !!success;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={st.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.iconWrap}
          >
            <Text style={st.icon}>{success ? '✅' : '✉️'}</Text>
          </LinearGradient>

          <Text style={st.title}>{t('verification.title')}</Text>
          <Text style={st.sub}>
            <Text style={st.emailTxt}>{email}</Text>
            {'\n'}{t('verification.subtitle')}
          </Text>

          {/* 6-box OTP input */}
          <View style={st.boxRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={r => { inputRefs.current[i] = r; }}
                style={[
                  st.box,
                  focused === i && !error && !success ? st.boxFocused  : null,
                  d && !error && !success             ? st.boxFilled   : null,
                  !!error                             ? st.boxError    : null,
                  !!success                           ? st.boxSuccess  : null,
                ]}
                value={d}
                onChangeText={txt => handleDigit(txt, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused(null)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                editable={!busy}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Error banner */}
          {!!error && (
            <View style={st.errorBanner}>
              <Text style={st.errorTxt}>❌ {error}</Text>
            </View>
          )}

          {/* Success banner */}
          {!!success && (
            <View style={st.successBanner}>
              <Text style={st.successTxt}>{success}</Text>
            </View>
          )}

          {/* Verify button */}
          <LinearGradient
            colors={
              success             ? ['#22c55e', '#16a34a']
              : busy || !codeReady ? ['#D1D5DB', '#D1D5DB']
              :                      ['#00BCD4', '#E91E63']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.btnWrap}
          >
            <Pressable
              onPress={() => doVerify()}
              disabled={busy || !codeReady}
              style={st.btn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={st.btnTxt}>
                    {success ? t('verification.verified') : t('verification.verify')}
                  </Text>}
            </Pressable>
          </LinearGradient>

          {/* Resend — single centred button, no duplicate label */}
          <View style={st.resendRow}>
            {canResend ? (
              <Pressable onPress={handleResend} disabled={resending} style={st.resendBtn}>
                {resending
                  ? <ActivityIndicator color="#00BCD4" size="small" />
                  : <Text style={st.resendTxt}>{t('resend_code')}</Text>}
              </Pressable>
            ) : (
              <View style={[st.resendBtn, st.resendBtnDisabled]}>
                <Text style={st.resendTxtOff}>
                  {timer > 0
                    ? t('verification.resendTimer').replace('{seconds}', String(timer))
                    : t('verification.maxResend')}
                </Text>
              </View>
            )}
          </View>

          {/* Attempt counter */}
          {resendCount > 0 && resendCount < MAX_RESEND && (
            <Text style={st.attemptTxt}>
              {t('verification.resendAttempt').replace('{count}', String(resendCount))}
            </Text>
          )}

          {/* Skip */}
          <Pressable onPress={handleSkip} disabled={loading} style={st.skipBtn}>
            <Text style={st.skipTxt}>{t('verification.skipForNow')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const BRAND = '#17a2b8';
const BOX   = 50;

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, alignItems: 'center', justifyContent: 'center' },

  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon:     { fontSize: 36 },
  title:    { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 8, textAlign: 'center' },
  sub:      { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  emailTxt: { fontWeight: '600', color: BRAND },

  // 6-box OTP — uniform default border, states layered on top
  boxRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  box: {
    width: BOX, height: BOX,
    borderWidth: 2, borderColor: '#ddd', borderRadius: 8,
    fontSize: 18, fontWeight: '700', color: '#000',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  boxFocused:  { borderColor: BRAND,     backgroundColor: '#f0f7ff' },
  boxFilled:   { borderColor: BRAND,     backgroundColor: '#f0f7ff' },
  boxError:    { borderColor: '#ff6b6b', backgroundColor: '#fff5f5' },
  boxSuccess:  { borderColor: '#28a745', backgroundColor: '#f0f7f0' },

  // Alert banners
  errorBanner:  { width: '100%', backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#ff6b6b', borderRadius: 4, padding: 12, marginBottom: 16 },
  errorTxt:     { color: '#ff6b6b', fontSize: 14, fontWeight: '500' },
  successBanner:{ width: '100%', backgroundColor: '#f0f7f0', borderLeftWidth: 4, borderLeftColor: '#28a745', borderRadius: 4, padding: 12, marginBottom: 16 },
  successTxt:   { color: '#28a745', fontSize: 14, fontWeight: '600' },

  // Verify button
  btnWrap: { width: '100%', borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
  btn:     { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  btnTxt:  { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Resend section
  resendRow:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f9f9f9' },
  resendLabel:      { color: '#666', fontSize: 14 },
  resendBtn:        { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#e8f4f8', borderRadius: 6, alignItems: 'center', justifyContent: 'center', minHeight: 36 },
  resendBtnDisabled:{ backgroundColor: '#f0f0f0' },
  resendTxt:        { color: BRAND,    fontSize: 14, fontWeight: '600' },
  resendTxtOff:     { color: '#999',   fontSize: 14, fontWeight: '500' },
  attemptTxt:       { fontSize: 12, color: '#999', marginBottom: 16, textAlign: 'center' },

  skipBtn: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  skipTxt: { color: BRAND, fontSize: 14, textDecorationLine: 'underline' },
});
