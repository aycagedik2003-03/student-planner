import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation, setLanguage } from '../i18n/translations';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { profileService } from '../api/ProfileService';
import { getErrorMessage } from '../api/ErrorHandler';
import { COLORS, RADII } from '../utils/constants';
import { verificationService } from '../api/VerificationService';
import { RootStackParamList } from '../../App';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';
import AccountTypeToggle from '../components/AccountTypeToggle';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
  route:      RouteProp<RootStackParamList, 'Auth'>;
};

export default function AuthScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const { width } = useWindowDimensions();
  const logoSize = width >= 768 ? 60 : 50;
  const setToken         = useAppStore((s) => s.setToken);
  const setUser          = useAppStore((s) => s.setUser);
  const setUserType      = useAppStore((s) => s.setUserType);
  const setProfile       = useAppStore((s) => s.setProfile);
  const setQuizCompleted = useAppStore((s) => s.setQuizCompleted);

  const initialMode = route.params?.mode ?? 'register';

  const [mode, setMode]                   = useState<'login' | 'register'>(initialMode);
  const [userRole, setUserRole]           = useState<'student' | 'landlord'>('student');
  const [firstName, setFirstName]         = useState('');
  const [lastName,  setLastName]          = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);

  // Refs for keyboard focus chaining: firstName → lastName → email → password
  const lastNameRef = useRef<TextInput>(null);
  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isLogin = mode === 'login';

  const validateEmail = useCallback(
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    [],
  );

  type PwErrorCode = 'pwErrMin' | 'pwErrUppercase' | 'pwErrDigit';
  const validatePassword = useCallback((pw: string): { valid: boolean; errors: PwErrorCode[] } => {
    const errors: PwErrorCode[] = [];
    if (pw.length < 8)      errors.push('pwErrMin');
    if (!/[A-Z]/.test(pw)) errors.push('pwErrUppercase');
    if (!/[0-9]/.test(pw)) errors.push('pwErrDigit');
    return { valid: errors.length === 0, errors };
  }, []);

  const validateForm = useCallback((): boolean => {
    setError('');
    if (!email.trim())                     { setError(t('errors.emptyEmail'));    return false; }
    if (!validateEmail(email))             { setError(t('errors.invalidEmail'));  return false; }
    if (!password)                         { setError(t('errors.emptyPassword')); return false; }
    if (!validatePassword(password).valid) { setError(t('errors.weakPassword')); return false; }
    if (!isLogin) {
      if (!firstName.trim()) { setError(t('errors.emptyName'));  return false; }
      if (!lastName.trim())  { setError(t('errors.emptyName'));  return false; }
      if (!agreedToTerms)    { setError(t('auth.acceptTerms')); return false; }
    }
    return true;
  }, [email, password, firstName, lastName, isLogin, agreedToTerms, validateEmail, validatePassword, t]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const response = await authService.register(email.trim(), password, userRole, fullName);
      const resolvedType = response.user_type ?? userRole;
      setToken(response.access_token);
      setUserType(resolvedType);
      setUser({ id: response.user_id, name: fullName, email: email.trim(), quizCompleted: false, userType: resolvedType });
      setError('');
      try {
        await verificationService.sendCode(email.trim());
      } catch {
        // continue even if send fails
      }
      navigation.replace('EmailVerification', { email: email.trim() });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(t('errors.emailAlreadyExists'));
        Alert.alert(
          t('errors.emailAlreadyExists'),
          t('auth.alreadyHaveAccount'),
          [
            { text: t('auth.login'), onPress: () => setMode('login') },
            { text: t('common.cancel') },
          ],
        );
        return;
      }
      setError(getErrorMessage(err, t, { isAuthEndpoint: true }));
    } finally {
      setLoading(false);
    }
  }, [email, password, firstName, lastName, userRole, validateForm, setToken, setUser, setUserType, navigation, t]);

  const handleLogin = useCallback(async () => {
    if (!email.trim()) { setError(t('errors.emptyEmail'));    return; }
    if (!password)     { setError(t('errors.emptyPassword')); return; }
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(email.trim(), password);
      const resolvedType = response.user_type ?? 'student';
      setToken(response.access_token);
      setUserType(resolvedType);
      setUser({ id: response.user_id, name: '', email: email.trim(), quizCompleted: false, userType: resolvedType });

      if (resolvedType === 'landlord') {
        Alert.alert(t('common.success'), t('auth.loginSuccess'));
        navigation.replace('LandlordTabs');
        return;
      }

      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData);
        const quizDone = !!(
          (profileData as any)?.quiz_completed ||
          profileData?.quizCompleted ||
          (profileData?.traits && profileData.traits.length > 0)
        );
        setQuizCompleted(quizDone);
        Alert.alert(t('common.success'), t('auth.loginSuccess'));
        navigation.replace(quizDone ? 'MainTabs' : 'Quiz');
      } catch {
        Alert.alert(t('common.success'), t('auth.loginSuccess'));
        navigation.replace('MainTabs');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail  ||
        err.message                 ||
        t('errors.invalidCredentials');
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [email, password, setToken, setUser, setUserType, setProfile, setQuizCompleted, navigation, t]);

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setAgreedToTerms(false);
    setShowPassword(false);
    setError('');
  };

  const LANGS = [
    { code: 'tr' as const, label: 'Türkçe' },
    { code: 'pl' as const, label: 'Polski' },
    { code: 'en' as const, label: 'English' },
  ];

  const pwResult = validatePassword(password);

  return (
    <SafeAreaView style={s.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={s.root}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Image
              source={require('../../assets/roomski-logo.png')}
              style={[s.logo, { width: logoSize, height: logoSize }]}
              resizeMode="contain"
            />
            <Text style={s.logoText}>roomski</Text>
          </View>

          <View style={s.form}>
            <Text style={s.title} adjustsFontSizeToFit numberOfLines={2}>
              {isLogin ? t('auth.login') : t('auth.register')}
            </Text>
            <Text style={s.subtitle}>
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </Text>

            {!isLogin && (
              <>
                <Text style={s.sectionLabel}>{t('auth.accountType')}</Text>
                <AccountTypeToggle
                  value={userRole}
                  onChange={setUserRole}
                  studentLabel={t('auth.student')}
                  studentDesc={t('auth.studentDesc')}
                  landlordLabel={t('auth.landlord')}
                  landlordDesc={t('auth.landlordDesc')}
                />
              </>
            )}

            {!isLogin && (
              <>
                <AuthInput
                  label={t('auth.firstName')}
                  placeholder={t('auth.firstNamePlaceholder')}
                  value={firstName}
                  onChangeText={(v) => { setFirstName(v); setError(''); }}
                  autoCapitalize="words"
                  autoComplete="off"
                  textContentType="givenName"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  editable={!loading}
                />
                <AuthInput
                  ref={lastNameRef}
                  label={t('auth.lastName')}
                  placeholder={t('auth.lastNamePlaceholder')}
                  value={lastName}
                  onChangeText={(v) => { setLastName(v); setError(''); }}
                  autoCapitalize="words"
                  autoComplete="off"
                  textContentType="familyName"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  editable={!loading}
                />
              </>
            )}

            <AuthInput
              ref={emailRef}
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />

            <AuthInput
              ref={passwordRef}
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              textContentType={isLogin ? 'password' : 'newPassword'}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!loading}
              accessoryRight={
                <Pressable onPress={() => setShowPassword((p) => !p)} style={s.eyeBtn}>
                  <Text style={s.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              }
            />

            {isLogin && (
              <Pressable
                onPress={() => navigation.navigate('PasswordReset')}
                style={s.forgotBtn}
                disabled={loading}
              >
                <Text style={s.forgotText}>{t('auth.forgotPassword')}</Text>
              </Pressable>
            )}

            {!isLogin && password.length > 0 && (
              pwResult.errors.length > 0 ? (
                <View style={s.pwFeedback}>
                  {pwResult.errors.map((code, i) => (
                    <Text key={i} style={s.pwError}>• {t(`auth.${code}`)}</Text>
                  ))}
                </View>
              ) : (
                <Text style={s.pwStrong}>✓ {t('auth.passwordStrong')}</Text>
              )
            )}

            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
                <Pressable
                  onPress={() => { setError(''); handleSubmit(); }}
                  disabled={loading}
                  style={s.retryBtn}
                >
                  <Text style={s.retryText}>↻ {t('common.tryAgain')}</Text>
                </Pressable>
              </View>
            )}

            {!isLogin && (
              <View style={s.termsRow}>
                <Checkbox
                  value={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  color={agreedToTerms ? COLORS.primary : undefined}
                  disabled={loading}
                  style={s.checkbox}
                />
                <Text style={s.termsText}>
                  {t('auth.agreeTerms')}{' '}
                  <Text onPress={() => navigation.navigate('PrivacyPolicy')} style={s.termsLink}>
                    {t('auth.privacyPolicy')}
                  </Text>
                  {' & '}
                  <Text onPress={() => navigation.navigate('TermsOfService')} style={s.termsLink}>
                    {t('auth.termsOfService')}
                  </Text>
                </Text>
              </View>
            )}

            <GradientButton
              label={isLogin ? t('auth.login') : t('auth.register')}
              onPress={handleSubmit}
              loading={loading}
            />

            {/* Switch mode — full translation already contains the action verb */}
            <Pressable style={s.switchRow} onPress={switchMode} disabled={loading}>
              <Text style={[s.switchText, loading && s.switchTextDisabled]}>
                {isLogin ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
              </Text>
            </Pressable>

            <View style={s.divider} />

            {/* Language selector */}
            <View style={s.langRow}>
              {LANGS.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={[s.langPill, language === lang.code && s.langPillOn]}
                >
                  <Text
                    style={[s.langText, language === lang.code && s.langTextOn]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.footer}>{t('auth.continueText')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: '#fff' },
  kav:          { flex: 1 },
  root:         { flex: 1, backgroundColor: '#fff' },
  scrollContent:{ flexGrow: 1, paddingBottom: 48 },

  header:       { flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4, marginBottom: 24 },
  logo:         { borderRadius: 12 },
  logoText:     { fontSize: 24, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.8 },

  form:         { paddingHorizontal: 24 },
  title:        { fontSize: 26, fontWeight: '800', color: COLORS.ink, marginBottom: 4, letterSpacing: -0.5, lineHeight: 32 },
  subtitle:     { fontSize: 13, color: COLORS.muted, marginBottom: 24, lineHeight: 19 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.soft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },

  eyeBtn:       { paddingHorizontal: 14, justifyContent: 'center', alignSelf: 'stretch', alignItems: 'center' },
  eyeIcon:      { fontSize: 16 },

  pwFeedback:   { marginTop: -8, marginBottom: 16, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8 },
  pwError:      { fontSize: 12, color: COLORS.error, marginBottom: 2, lineHeight: 17 },
  pwStrong:     { marginTop: -8, marginBottom: 16, fontSize: 12, color: '#10B981', fontWeight: '700' },

  errorBox:     { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginBottom: 16 },
  errorText:    { color: COLORS.error, fontSize: 13, lineHeight: 18 },
  retryBtn:     { marginTop: 8, alignSelf: 'flex-start' },
  retryText:    { color: COLORS.error, fontSize: 13, fontWeight: '700' },

  termsRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  checkbox:     { width: 18, height: 18, borderRadius: 4, marginTop: 2 },
  termsText:    { flex: 1, fontSize: 12, color: COLORS.soft, lineHeight: 18 },
  termsLink:    { color: COLORS.primary, textDecorationLine: 'underline' },

  // Switch mode: single pressable, full translation string
  switchRow:         { alignItems: 'center', marginTop: -4, marginBottom: 20, paddingVertical: 8 },
  switchText:        { color: COLORS.primary, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  switchTextDisabled:{ color: COLORS.muted },

  divider:      { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

  // Language pills
  langRow:      { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  langPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADII.pill,
                  backgroundColor: '#F1F5F9', minWidth: 72, alignItems: 'center' },
  langPillOn:   { backgroundColor: COLORS.primary },
  langText:     { color: COLORS.soft, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  langTextOn:   { color: '#fff' },

  footer:       { fontSize: 11, color: COLORS.muted, textAlign: 'center', lineHeight: 16,
                  paddingHorizontal: 8, marginBottom: 4 },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 10, marginBottom: 6, paddingVertical: 4 },
  forgotText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
