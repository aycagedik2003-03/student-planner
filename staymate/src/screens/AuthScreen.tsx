import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Picker } from '@react-native-picker/picker';
import { authService } from '../api/AuthService';
import { useAppStore } from '../store';
import { RootStackParamList } from '../../App';
import { parseApiError } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

// ── Design tokens (aynı app paletini kullanıyoruz) ───────────────────────────
const C = {
  bg:      '#FFFFFF',
  bgSoft:  '#FAFAFA',
  ink:     '#1F2937',
  soft:    '#4B5563',
  mute:    '#9CA3AF',
  line:    'rgba(31,41,55,0.10)',
  inputBg: '#F9FAFB',
  brandA:  '#00CFC8',   // teal
  brandB:  '#FF9ACD',   // pink
  error:   '#EF4444',
  errorBg: 'rgba(239,68,68,0.08)',
};

type Mode = 'login' | 'register';

export default function AuthScreen({ navigation }: Props) {
  const { setToken, setUser } = useAppStore();
  const language    = useAppStore(s => s.language);
  const setLanguage = useAppStore(s => s.setLanguage);
  const { t }       = useTranslation();

  const [mode, setMode]           = useState<Mode>('login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);

  const isLogin = mode === 'login';

  const clearForm = () => {
    setName(''); setEmail(''); setPassword(''); setErrorMsg(null);
  };

  const toggleMode = () => {
    clearForm();
    setMode(isLogin ? 'register' : 'login');
  };

  // ── API çağrısı ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setErrorMsg(null);

    // Basit client-side validasyon
    if (!email.trim())    { setErrorMsg('E-posta gerekli.'); return; }
    if (!password.trim()) { setErrorMsg('Şifre gerekli.'); return; }
    if (!isLogin && !name.trim()) { setErrorMsg('Ad Soyad gerekli.'); return; }
    if (password.length < 6)      { setErrorMsg('Şifre en az 6 karakter olmalı.'); return; }

    setLoading(true);
    try {
      const data = isLogin
        ? await authService.login(email.trim(), password)
        : await authService.register(email.trim(), password, name.trim());

      // Store'u güncelle
      setToken(data.access_token);
      setUser({
        id:            data.user.id,
        name:          data.user.name,
        email:         data.user.email,
        quizCompleted: false,
      });

      // Onboarding akışına yönlendir
      navigation.replace('Onboarding');
    } catch (err) {
      setErrorMsg(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Dekoratif aurora blobları ── */}
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
          {/* ── Logo + dil seçici ── */}
          <View style={st.logoRow}>
            <View style={st.logoMark}>
              <Text style={st.logoMarkTxt}>s</Text>
            </View>
            <Text style={st.logoTxt}>staymate</Text>
            <View style={st.betaBadge}>
              <Text style={st.betaTxt}>BETA</Text>
            </View>
            <View style={st.langPicker}>
              <Picker
                selectedValue={language}
                onValueChange={v => setLanguage(v as 'tr' | 'pl' | 'en')}
                style={st.langPickerInner}
                dropdownIconColor={C.mute}
              >
                <Picker.Item label="🇹🇷" value="tr" />
                <Picker.Item label="🇵🇱" value="pl" />
                <Picker.Item label="🇬🇧" value="en" />
              </Picker>
            </View>
          </View>

          {/* ── Kart ── */}
          <View style={st.card}>
            {/* Başlık */}
            <View style={st.cardHeader}>
              <Text style={st.title}>
                {isLogin ? 'Tekrar Hoş Geldin 👋' : 'Hesap Oluştur ✨'}
              </Text>
              <Text style={st.subtitle}>
                {isLogin
                  ? 'E-posta ve şifrenle giriş yap.'
                  : 'Ücretsiz hesap aç, ev arkadaşını bul.'}
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={st.form}>
              {/* Ad Soyad — sadece kayıt modunda */}
              {!isLogin && (
                <View style={st.fieldWrap}>
                  <Text style={st.label}>{t('auth.name')}</Text>
                  <TextInput
                    style={st.input}
                    placeholder="Adın ve soyadın"
                    placeholderTextColor={C.mute}
                    value={name}
                    onChangeText={(t) => { setName(t); setErrorMsg(null); }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              {/* E-posta */}
              <View style={st.fieldWrap}>
                <Text style={st.label}>{t('auth.email')}</Text>
                <TextInput
                  style={st.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={C.mute}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorMsg(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Şifre */}
              <View style={st.fieldWrap}>
                <Text style={st.label}>{t('auth.password')}</Text>
                <View style={st.pwWrap}>
                  <TextInput
                    style={[st.input, st.pwInput]}
                    placeholder="En az 6 karakter"
                    placeholderTextColor={C.mute}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorMsg(null); }}
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    style={st.eyeBtn}
                    onPress={() => setShowPw(p => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={st.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hata mesajı */}
              {errorMsg && (
                <View style={st.errorBox}>
                  <Text style={st.errorIcon}>⚠</Text>
                  <Text style={st.errorTxt}>{errorMsg}</Text>
                </View>
              )}

              {/* Submit butonu */}
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

            {/* ── Mod değiştir ── */}
            <TouchableOpacity style={st.switchBtn} onPress={toggleMode} activeOpacity={0.7}>
              <Text style={st.switchTxt}>
                {isLogin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
                {'  '}
                <Text style={st.switchLink}>
                  {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alt not */}
          <Text style={st.legalTxt}>
            Devam ederek Kullanım Şartları ve Gizlilik Politikasını kabul etmiş olursun.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },

  // Aurora blobları
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  blobTR: {
    width: 320,
    height: 320,
    backgroundColor: C.brandA,
    top: -100,
    right: -120,
  },
  blobBL: {
    width: 280,
    height: 280,
    backgroundColor: C.brandB,
    bottom: -80,
    left: -100,
  },

  // Layout
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  // Logo satırı
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
    marginTop: 8,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.brandA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  logoTxt: {
    color: C.ink,
    fontSize: 18,
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
  langPicker: {
    marginLeft: 'auto' as any,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: C.bgSoft,
  },
  langPickerInner: {
    height: 34,
    width: 80,
    color: C.ink,
  },

  // Kart
  card: {
    backgroundColor: C.bg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.line,
    padding: 24,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  cardHeader: {
    marginBottom: 24,
  },
  title: {
    color: C.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: C.soft,
    fontSize: 14,
    lineHeight: 20,
  },

  // Form
  form: {
    gap: 16,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    color: C.soft,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.ink,
  },

  // Şifre alanı
  pwWrap: {
    position: 'relative',
  },
  pwInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },

  // Hata kutusu
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FAECE7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorIcon: {
    fontSize: 14,
    color: '#D85A30',
    marginTop: 1,
  },
  errorTxt: {
    color: '#D85A30',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  // Submit butonu
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.brandA,
    borderRadius: 999,
    paddingVertical: 17,
    marginTop: 4,
    shadowColor: C.brandA,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  submitArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Mod değiştir
  switchBtn: {
    alignItems: 'center',
    paddingTop: 20,
  },
  switchTxt: {
    color: C.mute,
    fontSize: 13,
    fontWeight: '500',
  },
  switchLink: {
    color: C.brandA,
    fontWeight: '700',
  },

  // Alt not
  legalTxt: {
    color: C.mute,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
