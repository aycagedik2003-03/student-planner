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
import { getErrorMessage } from '../api/ErrorHandler';
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
  const setUserType     = useAppStore((s) => s.setUserType);

  const initialMode = route.params?.mode ?? 'register';

  const [mode, setMode]                   = useState<'login' | 'register'>(initialMode);
  const [userRole, setUserRole]           = useState<'student' | 'landlord'>('student');
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

  const validatePassword = useCallback((pw: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pw.length < 8)        errors.push('Min 8 karakter');
    if (!/[A-Z]/.test(pw))   errors.push('1 büyük harf gerekli (A-Z)');
    if (!/[0-9]/.test(pw))   errors.push('1 rakam gerekli (0-9)');
    return { valid: errors.length === 0, errors };
  }, []);

  const validateForm = useCallback((): boolean => {
    setError('');
    if (!email.trim())                    { setError(t('errors.emptyEmail'));    return false; }
    if (!validateEmail(email))            { setError(t('errors.invalidEmail'));  return false; }
    if (!password)                        { setError(t('errors.emptyPassword')); return false; }
    if (!validatePassword(password).valid){ setError(t('errors.weakPassword')); return false; }
    if (!isLogin) {
      if (!name.trim())   { setError(t('errors.emptyName'));  return false; }
      if (!agreedToTerms) { setError(t('auth.acceptTerms')); return false; }
    }
    return true;
  }, [email, password, name, isLogin, agreedToTerms, validateEmail, validatePassword, t]);

  // ── Register ─────────────────────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Register attempt:', { email });
      const response = await authService.register(email.trim(), password, userRole);
      console.log('Register success:', response.user_id, 'type:', response.user_type);

      const resolvedType = response.user_type ?? userRole;
      setToken(response.access_token);
      setUserType(resolvedType);
      setUser({ id: response.user_id, name: name.trim(), email: email.trim(), quizCompleted: false, userType: resolvedType });

      setError('');
      Alert.alert(t('common.success'), t('auth.registerSuccess'));
      if (resolvedType === 'landlord') {
        navigation.replace('LandlordTabs');
      } else {
        navigation.replace('Quiz');
      }
    } catch (err: any) {
      console.error('❌ Register error:', err);

      if (err.response?.status === 409) {
        setError(t('errors.emailAlreadyExists'));
        Alert.alert(
          'Email Zaten Kayıtlı',
          'Bu email ile bir hesap var. Giriş yapmayı deneyin.',
          [
            { text: 'Giriş Yap', onPress: () => setMode('login') },
            { text: 'İptal' },
          ],
        );
        return;
      }

      setError(getErrorMessage(err, t));
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

      const resolvedType = response.user_type ?? 'student';
      setToken(response.access_token);
      setUserType(resolvedType);
      setUser({ id: response.user_id, name: '', email: email.trim(), quizCompleted: false, userType: resolvedType });

      Alert.alert(t('common.success'), t('auth.loginSuccess'));
      if (resolvedType === 'landlord') {
        navigation.replace('LandlordTabs');
      } else {
        navigation.replace('MainTabs');
      }
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

      {/* Header: logo */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: C.brand }}>staymate</Text>
      </View>

      {/* Form */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          {isLogin ? t('auth.login') : t('auth.register')} ✨
        </Text>
        <Text style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
          {isLogin ? 'Var olan hesabınızla giriş yapın' : t('auth.agreeTerms')}
        </Text>

        {/* Role selector — register only */}
        {!isLogin && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 10 }}>Hesap Türü</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {([
                { value: 'student',  label: '🎓 Öğrenci',   desc: 'Oda arkadaşı ara' },
                { value: 'landlord', label: '🏠 Ev Sahibi', desc: 'İlan yayınla' },
              ] as const).map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setUserRole(opt.value)}
                  style={{
                    flex: 1, borderRadius: 12, padding: 14,
                    borderWidth: 2,
                    borderColor: userRole === opt.value ? C.brand : C.border,
                    backgroundColor: userRole === opt.value ? '#E6FBFA' : '#fff',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: userRole === opt.value ? C.brand : C.muted }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{opt.desc}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

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

          {/* Password strength feedback — register only */}
          {!isLogin && password && validatePassword(password).errors.length > 0 && (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#FAECE7', borderRadius: 6 }}>
              {validatePassword(password).errors.map((err, idx) => (
                <Text key={idx} style={{ fontSize: 11, color: '#D85A30', marginBottom: 4 }}>
                  ❌ {err}
                </Text>
              ))}
            </View>
          )}
          {!isLogin && password && validatePassword(password).valid && (
            <Text style={{ marginTop: 8, fontSize: 11, color: '#1D9E75', fontWeight: 'bold' }}>
              ✅ Şifre güçlü
            </Text>
          )}
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

        {/* Dil seçeneği — buton altında */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 20 }}>
          {LANGS.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 16,
                backgroundColor: language === lang.code ? C.brand : C.brandBg,
              }}
            >
              <Text style={{ color: language === lang.code ? '#fff' : C.brandTx, fontSize: 11, fontWeight: '500' }}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </View>

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
