import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/translations';
import api from '../api/client';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const C = { bg: '#fff', ink: '#1F2937', soft: '#4B5563', mute: '#9CA3AF', line: '#E5E7EB', brand: '#00BCD4', brandBg: '#E1F5EE', error: '#EF4444' };

export default function ChangeEmailScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [newEmail,  setNewEmail]  = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async () => {
    if (!newEmail.trim()) { setError(t('errors.emptyEmail')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setError(t('errors.invalidEmail')); return; }
    if (!password) { setError(t('errors.emptyPassword')); return; }

    setLoading(true);
    setError('');
    try {
      await api.put('/auth/change-email', { new_email: newEmail.trim(), password });
      Alert.alert(t('common.success'), t('settings.emailUpdated'), [
        { text: t('common.close'), onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errors.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backBtnTxt}>←</Text>
        </Pressable>
        <Text style={st.title}>{t('settings.changeEmail')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={st.body}>
        <Text style={st.desc}>{t('settings.changeEmailDesc')}</Text>

        <Text style={st.label}>{t('auth.email')}</Text>
        <TextInput
          style={st.input}
          value={newEmail}
          onChangeText={v => { setNewEmail(v); setError(''); }}
          placeholder="yeni@email.com"
          placeholderTextColor={C.mute}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={st.label}>{t('auth.password')}</Text>
        <TextInput
          style={st.input}
          value={password}
          onChangeText={v => { setPassword(v); setError(''); }}
          placeholder={t('auth.passwordPlaceholder')}
          placeholderTextColor={C.mute}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={st.error}>⚠ {error}</Text> : null}

        <Pressable style={[st.btn, loading && st.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={st.btnTxt}>{t('common.save')}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backBtnTxt:{ fontSize: 18, color: C.ink },
  title:     { fontSize: 18, fontWeight: '800', color: C.ink },
  body:      { padding: 24 },
  desc:      { fontSize: 14, color: C.soft, marginBottom: 24, lineHeight: 20 },
  label:     { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 8 },
  input:     { borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, fontSize: 14, color: C.ink, marginBottom: 16, backgroundColor: '#FAFAFA' },
  error:     { color: C.error, fontSize: 13, marginBottom: 16 },
  btn:       { backgroundColor: C.brand, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ backgroundColor: '#9CA3AF' },
  btnTxt:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});

