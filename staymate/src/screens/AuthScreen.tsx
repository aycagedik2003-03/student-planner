import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { profileService } from '../api/ProfileService';
import { getErrorMessage } from '../api/ErrorHandler';
import { validatePassword } from '../utils/passwordValidator';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

const C = {
  bg:      '#FFFFFF',
  bgSoft:  '#FAFAFA',
  ink:     '#1F2937',
  soft:    '#4B5563',
  mute:    '#9CA3AF',
  line:    'rgba(31,41,55,0.10)',
  inputBg: '#F9FAFB',
  brand:   '#1D9E75',
  brandBg: '#E1F5EE',
  brandTx: '#085041',
  brandA:  '#00CFC8',
  brandB:  '#FF9ACD',
};

type Mode = 'login' | 'register';

const LANGUAGES = [
  { code: 'tr' as const, label: 'Türkçe' },
  { code: 'pl' as const, label: 'Polski' },
  { code: 'en' as const, label: 'English' },
];

export default function AuthScreen({ navigation }: Props) {
  const { setToken, setUser } = useAppStore();
  const { t, language }      = useTranslation();
  const setLanguage          = useAppStore((s) => s.setLanguage);

  const [mode, setMode]                   = useState<Mode>('register');
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const isLogin = mode === 'login';

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateEmail = useCallback((v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordErrors(validatePassword(text).errors);
    setError('');
  }, []);

  const validateForm = useCallback((): boolean => {
    setError('');

    if (!email.trim())         { setError(t('errors.emptyEmail'));    return false; }
    if (!validateEmail(email)) { setError(t('errors.invalidEmail'));  return false; }
    if (!password)             { setError(t('errors.emptyPassword')); return false; }

    const pwResult = validatePassword(password);
    if (!pwResult.valid) { setError(pwResult.errors.join('\n')); return false; }

    if (!isLogin) {
      if (!name.trim())   { setError(t('errors.emptyName'));  return false; }
      if (!agreedToTerms) { setError(t('auth.acceptTerms')); return false; }
    }
    return true;
  }, [email, password, name, isLogin, agreedToTerms, validateEmail, t]);

  // ── Register ─────────────────────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Step 1: create account
      const data = await authService.register(email.trim(), password);
      setToken(data.access_token);
      setUser({ id: data.user_id, name: name.trim(), email: email.trim(), quizCompleted: false });

      // Step 2: persist name to profile
      await profileService.updateProfile({ name: name.trim(), age: null, city: null, university: null });

      setError('');
      Alert.alert(t('common.success'), t('auth.registerSuccess'));
      navigation.replace('Onboarding');
    } catch (err: any) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [email, password, name, validateForm, setToken, setUser, navigation, t]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      setToken(data.access_token);
      setUser({ id: data.user_id, name: '', email: email.trim(), quizCompleted: false });

      setError('');
      Alert.alert(t('common.success'), t('auth.loginSuccess'));
      navigation.replace('Onboarding');
    } catch (err: any) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [email, password, validateForm, setToken, setUser, navigation, t]);

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  const toggleMode = () => {
    setName(''); setEmail(''); setPassword(''); setError('');
    setAgreedToTerms(false); setPasswordErrors([]);
    setMode(isLogin ? 'register' : 'login');
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={[st.blob, st.blobTR]} />
      <View style={[st.blob, st.blobBL]} />

      <KeyboardAvoidingView
        style={st.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={st.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header row: logo + language selector */}
          <View style={st.header}>
            <View style={st.logoRow}>
              <View style={st.logoMark}>
                <Text style={st.logoMarkTxt}>s</Text>
              </View>
              <Text style={st.logoTxt}>staymate</Text>
              <View style={st.betaBadge}>
                <Text style={st.betaTxt}>BETA</Text>
              </View>
            </View>

            <View style={st.langRow}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={[st.langBtn, language === lang.code && st.langBtnActive]}
                >
                  <Text style={[st.langBtnTxt, language === lang.code && st.langBtnTxtActive]}>
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Card */}
          <View style={st.card}>
            <Text style={st.title}>
              {isLogin ? `${t('common.welcome')} 👋` : `${t('auth.register')} ✨`}
            </Text>
            <Text style={st.subtitle}>
              {isLogin ? t('auth.email') + ' & ' + t('auth.password').toLowerCase() : t('common.welcome')}
            </Text>

            <View style={st.form}>
              {/* Name — register only */}
              {!isLogin && (
                <View style={st.fieldWrap}>
                  <Text style={st.label}>{t('auth.name')}</Text>
                  <TextInput
                    style={st.input}
                    placeholder={t('auth.namePlaceholder')}
                    placeholderTextColor={C.mute}
                    value={name}
                    onChangeText={(v) => { setName(v); setError(''); }}
                    autoCapitalize="words"
                    returnKeyType="next"
                    editable={!loading}
                  />
                </View>
              )}

              {/* Email */}
              <View style={st.fieldWrap}>
                <Text style={st.label}>{t('auth.email')}</Text>
                <TextInput
                  style={st.input}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={C.mute}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              {/* Password */}
              <View style={st.fieldWrap}>
                <Text style={st.label}>{t('auth.password')}</Text>
                <View style={st.pwWrap}>
                  <TextInput
                    style={[
                      st.input, st.pwInput,
                      password && passwordErrors.length > 0 && st.inputError,
                    ]}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={C.mute}
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={st.eyeBtn}
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={st.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Live password feedback */}
                {password && passwordErrors.length > 0 && (
                  <View style={st.pwErrorBox}>
                    {passwordErrors.map((err, i) => (
                      <Text key={i} style={st.pwErrorTxt}>⚠ {err}</Text>
                    ))}
                  </View>
                )}
                {password && passwordErrors.length === 0 && (
                  <Text style={st.pwOkTxt}>✓ Şifre güçlü</Text>
                )}
              </View>

              {/* Terms checkbox — register only */}
              {!isLogin && (
                <View style={st.termsRow}>
                  <Checkbox
                    value={agreedToTerms}
                    onValueChange={setAgreedToTerms}
                    color={agreedToTerms ? C.brand : undefined}
                    style={st.checkbox}
                    disabled={loading}
                  />
                  <Text style={st.termsTxt}>
                    <Text
                      onPress={() => navigation.navigate('PrivacyPolicy')}
                      style={st.termsLink}
                    >
                      {t('auth.privacyPolicy')}
                    </Text>
                    {' & '}
                    <Text
                      onPress={() => navigation.navigate('TermsOfService')}
                      style={st.termsLink}
                    >
                      {t('auth.termsOfService')}
                    </Text>
                    {'\'nı okudum, kabul ediyorum.'}
                  </Text>
                </View>
              )}

              {/* Error */}
              {error ? (
                <View style={st.errorBox}>
                  <Text style={st.errorIcon}>⚠</Text>
                  <Text style={st.errorTxt}>{error}</Text>
                </View>
              ) : null}

              {/* Submit */}
              <TouchableOpacity
                style={[st.submitBtn, loading && st.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.82}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={st.submitTxt}>
                      {isLogin ? t('auth.login') : t('auth.register')}
                    </Text>
                    <Text style={st.submitArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle mode */}
            <TouchableOpacity style={st.switchBtn} onPress={toggleMode} activeOpacity={0.7} disabled={loading}>
              <Text style={st.switchTxt}>
                {isLogin ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={st.legalTxt}>{t('auth.continueText')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },

  blob:   { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  blobTR: { width: 320, height: 320, backgroundColor: C.brandA, top: -100, right: -120 },
  blobBL: { width: 280, height: 280, backgroundColor: C.brandB, bottom: -80, left: -100 },

  kav:    { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32, justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 8 },

  logoRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark:    { width: 30, height: 30, borderRadius: 10, backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center' },
  logoMarkTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logoTxt:     { color: C.ink, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  betaBadge:   { backgroundColor: C.bgSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(31,41,55,0.10)' },
  betaTxt:     { color: C.mute, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  langRow:        { flexDirection: 'row', gap: 6 },
  langBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: C.brandBg },
  langBtnActive:  { backgroundColor: C.brand },
  langBtnTxt:     { color: C.brandTx, fontSize: 11, fontWeight: '500' },
  langBtnTxtActive:{ color: '#fff' },

  card: {
    backgroundColor: C.bg, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(31,41,55,0.10)',
    padding: 24, shadowColor: '#1F2937', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08, shadowRadius: 32, elevation: 6,
  },
  title:    { color: C.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { color: C.soft, fontSize: 14, lineHeight: 20, marginBottom: 24 },

  form:      { gap: 16 },
  fieldWrap: { gap: 6 },
  label:     { color: C.soft, fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  input: {
    backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: 'rgba(31,41,55,0.10)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.ink,
  },

  pwWrap:     { position: 'relative' },
  pwInput:    { paddingRight: 52 },
  inputError: { borderColor: '#D85A30' },
  eyeBtn:     { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeIcon:    { fontSize: 18 },
  pwErrorBox: { marginTop: 6, padding: 8, backgroundColor: '#FAECE7', borderRadius: 8 },
  pwErrorTxt: { fontSize: 11, color: '#D85A30', marginBottom: 2, lineHeight: 16 },
  pwOkTxt:    { marginTop: 6, fontSize: 11, color: '#1D9E75', fontWeight: '600' },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, marginTop: 2 },
  termsTxt: { flex: 1, color: C.soft, fontSize: 12.5, lineHeight: 19 },
  termsLink:{ color: C.brand, fontWeight: '600', textDecorationLine: 'underline' },

  errorBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FAECE7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  errorIcon: { fontSize: 14, color: '#D85A30', marginTop: 1 },
  errorTxt:  { color: '#D85A30', fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 18 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.brand, borderRadius: 999, paddingVertical: 17, marginTop: 4,
    shadowColor: C.brand, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 20, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.7, shadowOpacity: 0, elevation: 0 },
  submitTxt:   { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  submitArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },

  switchBtn: { alignItems: 'center', paddingTop: 20 },
  switchTxt: { color: C.mute, fontSize: 13, fontWeight: '500' },

  legalTxt: { color: C.mute, fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 20, paddingHorizontal: 16 },
});
