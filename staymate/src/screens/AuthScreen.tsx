import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
  route:      RouteProp<RootStackParamList, 'Auth'>;
};

const C = {
  brand:   '#1D9E75',
  brandBg: '#E1F5EE',
  brandTx: '#085041',
  error:   '#D85A30',
  errorBg: '#FAECE7',
  muted:   '#888',
  border:  '#ddd',
};

export default function AuthScreen({ navigation, route }: Props) {
  const { t, language } = useTranslation();
  const setLanguage     = useAppStore((s) => s.setLanguage);
  const setToken        = useAppStore((s) => s.setToken);
  const setUser         = useAppStore((s) => s.setUser);

  const initialMode = route.params?.mode ?? 'register';

  const [mode, setMode]                   = useState<'login' | 'register'>(initialMode);
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);

  const isLogin = mode === 'login';

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateEmail = useCallback(
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    [],
  );

  const checkPasswordStrength = useCallback(
    (v: string) => v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v),
    [],
  );

  const validateForm = useCallback((): boolean => {
    setError('');
    if (!email.trim())             { setError(t('errors.emptyEmail'));    return false; }
    if (!validateEmail(email))     { setError(t('errors.invalidEmail'));  return false; }
    if (!password)                 { setError(t('errors.emptyPassword')); return false; }
    if (!checkPasswordStrength(password)) { setError(t('errors.weakPassword')); return false; }
    if (!isLogin) {
      if (!name.trim())   { setError(t('errors.emptyName'));  return false; }
      if (!agreedToTerms) { setError(t('auth.acceptTerms')); return false; }
    }
    return true;
  }, [email, password, name, isLogin, agreedToTerms, validateEmail, checkPasswordStrength, t]);

  // ── Register ─────────────────────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      console.log('Register attempt:', { email });
      const response = await authService.register(email.trim(), password);
      console.log('Register success:', response.user_id);

      setToken(response.access_token);
      setUser({ id: response.user_id, name: name.trim(), email: email.trim(), quizCompleted: false });

      setError('');
      Alert.alert(t('common.success'), t('auth.registerSuccess'));
      navigation.replace('Quiz');
    } catch (err: any) {
      console.error('Register error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail  ||
        err.message                 ||
        t('errors.unknownError');
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [email, password, name, validateForm, setToken, setUser, navigation, t]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (!email.trim()) { setError(t('errors.emptyEmail'));    return; }
    if (!password)     { setError(t('errors.emptyPassword')); return; }

    setLoading(true);
    setError('');
    try {
      console.log('Login attempt:', { email });
      const response = await authService.login(email.trim(), password);
      console.log('Login success:', response.user_id);

      setToken(response.access_token);
      setUser({ id: response.user_id, name: '', email: email.trim(), quizCompleted: false });

      Alert.alert(t('common.success'), t('auth.loginSuccess'));
      navigation.replace('MainTabs');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail  ||
        err.message                 ||
        t('errors.invalidCredentials');
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [email, password, setToken, setUser, navigation, t]);

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError(''); setName(''); setEmail(''); setPassword('');
  };

  // ── Language buttons ─────────────────────────────────────────────────────────
  const LANGS = [
    { code: 'tr' as const, label: 'Türkçe' },
    { code: 'pl' as const, label: 'Polski' },
    { code: 'en' as const, label: 'English' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header: logo + language selector */}
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: C.brand }}>staymate</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {LANGS.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                backgroundColor: language === lang.code ? C.brand : C.brandBg,
              }}
            >
              <Text style={{ color: language === lang.code ? '#fff' : C.brandTx, fontSize: 12, fontWeight: '500' }}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Form */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          {isLogin ? t('auth.login') : t('auth.register')} ✨
        </Text>
        <Text style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
          {isLogin ? 'Mevcut hesabına giriş yap' : 'Yeni hesap oluştur'}
        </Text>

        {/* Name — register only */}
        {!isLogin && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>{t('auth.name')}</Text>
            <TextInput
              placeholder={t('auth.namePlaceholder')}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              autoCapitalize="words"
              style={{ borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12 }}
              editable={!loading}
            />
          </View>
        )}

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>{t('auth.email')}</Text>
          <TextInput
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12 }}
            editable={!loading}
          />
        </View>

        {/* Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>{t('auth.password')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleSubmit}
              style={{ flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12 }}
              editable={!loading}
            />
            <Pressable onPress={() => setShowPassword((p) => !p)} style={{ marginLeft: 10 }}>
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ backgroundColor: C.errorBg, padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: C.error, fontSize: 13 }}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Terms — register only */}
        {!isLogin && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 10 }}>
            <Checkbox
              value={agreedToTerms}
              onValueChange={setAgreedToTerms}
              color={agreedToTerms ? C.brand : undefined}
              disabled={loading}
              style={{ width: 18, height: 18, borderRadius: 4, marginTop: 2 }}
            />
            <Text style={{ flex: 1, fontSize: 12, color: '#444', lineHeight: 18 }}>
              {t('auth.agreeTerms')}{' '}
              <Text onPress={() => navigation.navigate('PrivacyPolicy')} style={{ color: C.brand, textDecorationLine: 'underline' }}>
                {t('auth.privacyPolicy')}
              </Text>
              {' & '}
              <Text onPress={() => navigation.navigate('TermsOfService')} style={{ color: C.brand, textDecorationLine: 'underline' }}>
                {t('auth.termsOfService')}
              </Text>
            </Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : C.brand,
            padding: 14, borderRadius: 8, marginBottom: 16,
            alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {isLogin ? t('auth.login') : t('auth.register')}
              </Text>
          }
        </Pressable>

        {/* Toggle mode */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Text style={{ color: C.muted }}>
            {isLogin ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
          </Text>
          <Pressable onPress={switchMode} disabled={loading}>
            <Text style={{ color: C.brand, fontWeight: 'bold' }}>
              {isLogin ? t('auth.register') : t('auth.login')}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={{ fontSize: 12, color: C.muted, marginTop: 24, textAlign: 'center' }}>
          {t('auth.continueText')}
        </Text>
      </View>
    </ScrollView>
  );
}
