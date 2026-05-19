import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../App';
import { verificationService, isVerifiedResponse } from '../api/VerificationService';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n/useTranslation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmailVerification'>;
  route:      RouteProp<RootStackParamList, 'EmailVerification'>;
};

const RESEND_SECONDS = 60;

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const email       = route.params?.email ?? '';
  const userType    = useAppStore(s => s.userType);
  const { t }       = useTranslation();

  const [code,          setCode]          = useState('');
  const [loading,       setLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer,         setTimer]         = useState(RESEND_SECONDS);
  const [error,         setError]         = useState('');

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = useCallback(async () => {
    if (code.trim().length < 6) {
      setError(t('verification.enterSixDigit'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verificationService.confirmCode(email, code.trim());
      if (isVerifiedResponse(res)) {
        if (userType === 'landlord') {
          navigation.replace('LandlordTabs');
        } else {
          navigation.replace('Quiz');
        }
      } else {
        setError(t('verification.codeInvalid'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || t('verification.verifyFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [code, email, userType, navigation, t]);

  const handleResend = useCallback(async () => {
    setResendLoading(true);
    setError('');
    try {
      await verificationService.sendCode(email);
      setTimer(RESEND_SECONDS);
      setCode('');
      Alert.alert(t('verification.codeSent'), t('verification.codeSentMsg'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.detail || t('verification.sendFailed'));
    } finally {
      setResendLoading(false);
    }
  }, [email, t]);

  const handleSkip = () => {
    if (userType === 'landlord') {
      navigation.replace('LandlordTabs');
    } else {
      navigation.replace('Quiz');
    }
  };

  return (
    <SafeAreaView style={st.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={st.body}>
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.iconWrap}
          >
            <Text style={st.icon}>✉️</Text>
          </LinearGradient>

          <Text style={st.title}>{t('verification.title')}</Text>
          <Text style={st.sub}>
            <Text style={st.email}>{email}</Text>
            {'\n'}{t('verification.subtitle')}
          </Text>

          <TextInput
            style={[st.input, error ? st.inputError : null]}
            placeholder="0  0  0  0  0  0"
            placeholderTextColor="#C0C0C0"
            value={code}
            onChangeText={v => { setCode(v.replace(/\D/g, '')); setError(''); }}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            autoFocus
          />

          {error ? <Text style={st.error}>⚠ {error}</Text> : null}

          <LinearGradient
            colors={loading || code.length < 6 ? ['#ccc', '#ccc'] : ['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.btnWrap}
          >
            <Pressable
              onPress={handleVerify}
              disabled={loading || code.length < 6}
              style={st.btn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={st.btnTxt}>{t('verification.verify')}</Text>}
            </Pressable>
          </LinearGradient>

          <Pressable
            onPress={handleResend}
            disabled={timer > 0 || resendLoading}
            style={[st.resendBtn, (timer > 0 || resendLoading) && st.resendBtnDisabled]}
          >
            {resendLoading
              ? <ActivityIndicator color="#00BCD4" size="small" />
              : <Text style={[st.resendTxt, (timer > 0) && st.resendTxtDisabled]}>
                  {timer > 0
                    ? t('verification.resendTimer').replace('{seconds}', String(timer))
                    : t('verification.resend')}
                </Text>}
          </Pressable>

          <Pressable onPress={handleSkip} style={st.skipBtn}>
            <Text style={st.skipTxt}>{t('verification.skipForNow')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#fff' },
  body:    { flex: 1, padding: 28, justifyContent: 'center', alignItems: 'center' },
  iconWrap:{ width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon:    { fontSize: 36 },
  title:   { fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 10, textAlign: 'center' },
  sub:     { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  email:   { fontWeight: '700', color: '#00BCD4' },
  input:   {
    width: '100%', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 14,
    padding: 18, fontSize: 28, fontWeight: '800', letterSpacing: 14,
    color: '#1F2937', marginBottom: 12, backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#EF4444' },
  error:   { color: '#EF4444', fontSize: 13, marginBottom: 16, alignSelf: 'flex-start' },
  btnWrap: { width: '100%', borderRadius: 12, marginBottom: 14 },
  btn:     { paddingVertical: 15, alignItems: 'center' },
  btnTxt:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn:         { width: '100%', padding: 14, borderWidth: 1.5, borderColor: '#00BCD4', borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  resendBtnDisabled: { borderColor: '#E5E7EB' },
  resendTxt:         { color: '#00BCD4', fontSize: 14, fontWeight: '600' },
  resendTxtDisabled: { color: '#9CA3AF' },
  skipBtn: { paddingVertical: 8 },
  skipTxt: { color: '#9CA3AF', fontSize: 13 },
});
