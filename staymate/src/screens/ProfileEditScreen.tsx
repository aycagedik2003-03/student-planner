import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { POLISH_CITIES } from '../constants/cities';
import { profileService } from '../api/ProfileService';
import { parseApiError } from '../api/client';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'> };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
};

export default function ProfileEditScreen({ navigation }: Props) {
  const storeProfile = useAppStore(s => s.profile);
  const setProfile   = useAppStore(s => s.setProfile);
  const quizCity     = useAppStore(s => s.quizCity);
  const setQuizCity  = useAppStore(s => s.setQuizCity);

  // Profil verilerini store'dan al, yoksa boş başlat
  const [name,    setName]    = useState(storeProfile?.name        ?? '');
  const [age,     setAge]     = useState(storeProfile?.age ? String(storeProfile.age) : '');
  const [city,    setCity]    = useState(storeProfile?.city        ?? quizCity ?? '');
  const [uni,     setUni]     = useState(storeProfile?.university  ?? '');
  const [bio,     setBio]     = useState(storeProfile?.bio         ?? '');
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQ,    setCityQ]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const shownCities = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(cityQ.toLowerCase()),
  );

  const save = async () => {
    if (!name.trim()) { Alert.alert('Hata', 'İsim boş bırakılamaz.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        age:  age ? parseInt(age, 10) : undefined,
        city: city || undefined,
        university: uni.trim() || undefined,
        bio: bio.trim() || undefined,
      };
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      if (city) setQuizCity(city);
      Alert.alert('✓ Kaydedildi', 'Profil bilgilerin güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Hata', parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>Profili Düzenle</Text>
        <View style={st.hBtn} />
      </View>

      <ScrollView
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Avatar */}
        <View style={st.avatarSection}>
          <View style={st.avatar}>
            <Text style={st.avatarTxt}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={st.photoBtn} activeOpacity={0.7}
            onPress={() => Alert.alert('Fotoğraf', 'Fotoğraf yükleme yakında kullanıma girecek.')}>
            <Text style={st.photoBtnTxt}>📷 Fotoğraf Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Ad */}
        <View style={st.section}>
          <Text style={st.label}>AD SOYAD</Text>
          <TextInput
            style={st.input}
            value={name}
            onChangeText={setName}
            placeholder="Adın soyadın"
            placeholderTextColor={C.mute}
          />
        </View>

        {/* Yaş */}
        <View style={st.section}>
          <Text style={st.label}>YAŞ</Text>
          <TextInput
            style={st.input}
            value={age}
            onChangeText={t => setAge(t.replace(/\D/g, '').slice(0, 2))}
            placeholder="25"
            placeholderTextColor={C.mute}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        {/* Şehir */}
        <View style={st.section}>
          <Text style={st.label}>ŞEHİR</Text>
          <TouchableOpacity
            style={[st.selectRow, city && st.selectRowActive]}
            onPress={() => setCityOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={[st.selectTxt, city && st.selectTxtActive]}>
              {city || 'Şehir seçin...'}
            </Text>
            <Text style={st.selectChev}>{cityOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {cityOpen && (
            <View style={st.dropdown}>
              <TextInput
                style={st.dropSearch}
                placeholder="Şehir ara..."
                placeholderTextColor={C.mute}
                value={cityQ}
                onChangeText={setCityQ}
              />
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {shownCities.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[st.dropItem, city === c && st.dropItemActive]}
                    onPress={() => { setCity(c); setCityOpen(false); setCityQ(''); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[st.dropItemTxt, city === c && st.dropItemTxtActive]}>{c}</Text>
                    {city === c && <Text style={st.dropCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Üniversite */}
        <View style={st.section}>
          <Text style={st.label}>ÜNİVERSİTE</Text>
          <TextInput
            style={st.input}
            value={uni}
            onChangeText={setUni}
            placeholder="Üniversite adı"
            placeholderTextColor={C.mute}
          />
        </View>

        {/* Biyografi */}
        <View style={st.section}>
          <Text style={st.label}>HAKKIMDA</Text>
          <TextInput
            style={[st.input, st.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Kendini kısaca tanıt..."
            placeholderTextColor={C.mute}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={st.charCount}>{bio.length}/300</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Footer */}
      <View style={st.footer}>
        <TouchableOpacity
          style={[st.saveBtn, saving && { opacity: 0.7 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={st.saveTxt}>Kaydet ✓</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn: {
    width: 38, height: 38, borderRadius: 999,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  hBtnTxt: { color: C.ink, fontSize: 17 },
  hTitle:  { color: C.ink, fontSize: 17, fontWeight: '800' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 84, height: 84, borderRadius: 999, backgroundColor: C.brandA,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  avatarTxt: { color: '#fff', fontSize: 34, fontWeight: '800' },
  photoBtn: {
    backgroundColor: C.tealBg, borderRadius: 999,
    paddingVertical: 8, paddingHorizontal: 18,
    borderWidth: 1, borderColor: C.brandA + '55',
  },
  photoBtnTxt: { color: C.tealTx, fontSize: 13, fontWeight: '600' },

  section: { marginBottom: 20 },
  label: {
    color: C.mute, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8,
  },
  input: {
    backgroundColor: C.bgSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    paddingVertical: 13, paddingHorizontal: 14,
    color: C.ink, fontSize: 15,
  },
  textArea: { minHeight: 100, paddingTop: 13 },
  charCount: { color: C.mute, fontSize: 11, textAlign: 'right', marginTop: 4 },

  selectRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  selectRowActive: { borderColor: C.brandA, backgroundColor: C.tealBg },
  selectTxt:       { flex: 1, color: C.mute, fontSize: 15 },
  selectTxtActive: { color: C.ink, fontWeight: '600' },
  selectChev:      { color: C.mute, fontSize: 12 },

  dropdown: {
    backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.line,
    marginTop: 6, overflow: 'hidden',
    shadowColor: '#1F2937', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  dropSearch: {
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.ink,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  dropItemActive: { backgroundColor: C.tealBg },
  dropItemTxt:    { color: C.soft, fontSize: 14 },
  dropItemTxtActive: { color: C.ink, fontWeight: '700' },
  dropCheck:      { color: C.brandA, fontWeight: '800' },

  footer: {
    paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg,
  },
  saveBtn: {
    backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
