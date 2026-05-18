import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import api from '../api/client';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const C = { bg: '#fff', ink: '#1F2937', soft: '#4B5563', mute: '#9CA3AF', line: '#E5E7EB', danger: '#EF4444', dangerBg: '#FEF2F2' };

export default function DeleteAccountScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const { clearUser, resetFilters, setQuizAnswers, setVerified, clearFilteredMatches, setProfile, setActiveMatches } = useAppStore.getState();

  const handleDelete = () => {
    if (!password) { setError(t('errors.emptyPassword')); return; }
    if (confirm.toLowerCase() !== 'sil') {
      setError('Onaylamak için "SİL" yazın.'); return;
    }

    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'), style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError('');
            try {
              await api.delete('/auth/account', { data: { password } });
              await authService.logout();
              clearUser();
              resetFilters();
              setQuizAnswers([]);
              setVerified(false);
              clearFilteredMatches();
              setProfile(null);
              setActiveMatches([]);
              navigation.navigate('Auth');
            } catch (err: any) {
              setError(err.response?.data?.detail || t('errors.unknownError'));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backBtnTxt}>←</Text>
        </Pressable>
        <Text style={st.title}>{t('settings.deleteAccount')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={st.body}>
        <View style={st.warnCard}>
          <Text style={st.warnIcon}>⚠️</Text>
          <Text style={st.warnTitle}>Bu işlem geri alınamaz</Text>
          <Text style={st.warnDesc}>{t('settings.deleteConfirm')}</Text>
        </View>

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

        <Text style={st.label}>Onaylamak için "SİL" yazın</Text>
        <TextInput
          style={st.input}
          value={confirm}
          onChangeText={v => { setConfirm(v); setError(''); }}
          placeholder="SİL"
          placeholderTextColor={C.mute}
          autoCapitalize="characters"
        />

        {error ? <Text style={st.error}>⚠ {error}</Text> : null}

        <Pressable style={[st.btn, loading && st.btnDisabled]} onPress={handleDelete} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={st.btnTxt}>🗑 {t('settings.deleteAccount')}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backBtnTxt: { fontSize: 18, color: C.ink },
  title:      { fontSize: 18, fontWeight: '800', color: C.danger },
  body:       { padding: 24 },
  warnCard:   { backgroundColor: C.dangerBg, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: C.danger + '33' },
  warnIcon:   { fontSize: 36, marginBottom: 10 },
  warnTitle:  { fontSize: 16, fontWeight: '800', color: C.danger, marginBottom: 8 },
  warnDesc:   { fontSize: 13, color: C.soft, textAlign: 'center', lineHeight: 20 },
  label:      { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 8 },
  input:      { borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, fontSize: 14, color: C.ink, marginBottom: 16, backgroundColor: '#FAFAFA' },
  error:      { color: C.danger, fontSize: 13, marginBottom: 16 },
  btn:        { backgroundColor: C.danger, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ backgroundColor: '#9CA3AF' },
  btnTxt:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
