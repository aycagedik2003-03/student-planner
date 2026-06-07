import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '../i18n/translations';
import { authService } from '../api/AuthService';
import { COLORS, RADII } from '../utils/constants';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PasswordReset'>;
};

export default function PasswordResetScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.enterEmail'));
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      Alert.alert(t('common.success'), t('auth.resetEmailSent'));
      navigation.goBack();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        Alert.alert(t('common.error'), t('auth.emailNotFound'));
      } else {
        Alert.alert(t('common.error'), t('common.tryAgain'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
        <Text style={s.backText}>← {t('common.back')}</Text>
      </Pressable>

      <Text style={s.title}>{t('auth.resetPassword')}</Text>
      <Text style={s.subtitle}>{t('auth.enterEmailReset')}</Text>

      <TextInput
        placeholder={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        style={s.input}
        placeholderTextColor={COLORS.muted}
      />

      <Pressable
        onPress={handleSendReset}
        disabled={loading}
        style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>{t('auth.sendReset')}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#fff' },
  content:  { padding: 24, paddingTop: 56 },

  backBtn:  { marginBottom: 32 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },

  title:    { fontSize: 28, fontWeight: '800', color: '#1a1a2e', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 28, lineHeight: 20 },

  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADII.md ?? 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#FAFAFA',
  },

  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill ?? 24,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
