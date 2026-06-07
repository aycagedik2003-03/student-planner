import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator, Image, Platform,
} from 'react-native';

// expo-image-picker loaded lazily — same pattern as CreateListingScreen
let ImagePicker: typeof import('expo-image-picker') | null = null;
try { ImagePicker = require('expo-image-picker'); } catch {}
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { POLISH_CITIES } from '../constants/cities';
import { profileService } from '../api/ProfileService';
import { getErrorMessage } from '../api/ErrorHandler';
import { useTranslation } from '../i18n/translations';
import { storage } from '../utils/storage';
import PhotoCropperModal from '../components/PhotoCropperModal';

const AVATAR_URL = 'https://web-production-63097.up.railway.app/api/v1/profile/avatar';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'> };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
};

export default function ProfileEditScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const storeProfile = useAppStore(s => s.profile);
  const setProfile   = useAppStore(s => s.setProfile);
  const quizCity     = useAppStore(s => s.quizCity);
  const setQuizCity  = useAppStore(s => s.setQuizCity);
  const userType     = useAppStore(s => s.userType);
  const isLandlord   = userType === 'landlord';

  const [name,     setName]     = useState(storeProfile?.name       ?? '');
  const [age,      setAge]      = useState(storeProfile?.age ? String(storeProfile.age) : '');
  const [city,     setCity]     = useState(storeProfile?.city       ?? quizCity ?? '');
  const [uni,      setUni]      = useState(storeProfile?.university ?? '');
  const [bio,      setBio]      = useState(storeProfile?.bio        ?? '');
  const [phone,    setPhone]    = useState((storeProfile as any)?.phone ?? '');
  const [photoUri,      setPhotoUri]      = useState<string | null>((storeProfile as any)?.photoUrl ?? null);
  const [tempPath,      setTempPath]      = useState<string | null>(null);
  const [cropVisible,   setCropVisible]   = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [cityOpen,       setCityOpen]       = useState(false);
  const [cityQ,          setCityQ]          = useState('');
  const [uniOpen,        setUniOpen]        = useState(false);
  const [saving,         setSaving]         = useState(false);

  const shownCities = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(cityQ.toLowerCase()),
  );

  const UNIVERSITIES = [
    'Uniwersytet im. Adama Mickiewicza w Poznaniu',
    'Politechnika Poznańska',
    'Wyższa Szkoła Bankowa w Poznaniu',
    'Uniwersytet Medyczny im. Karola Marcinkowskiego',
    'Akademia Sztuk Pięknych w Poznaniu',
    'Uniwersytet Wrocławski',
    'Politechnika Wrocławska',
    'Uniwersytet Ekonomiczny we Wrocławiu',
    'Uniwersytet Warszawski',
    'Politechnika Warszawska',
    'Uniwersytet Jagielloński',
    'AGH Akademia Górniczo-Hutnicza',
    'Politechnika Gdańska',
    'Uniwersytet Gdański',
    'SWPS Uniwersytet Humanistycznospołeczny',
  ];

  const uploadAvatar = async (file: File | { uri: string; name: string; type: string }) => {
    setUploading(true);
    try {
      const token = await storage.getItem('userToken');
      const formData = new FormData();
      formData.append('file', file as any);

      const res = await fetch(AVATAR_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        // Read the body even on error so we can log the real cause
        let body = '';
        try { body = await res.text(); } catch { /* ignore */ }
        if (__DEV__) {
          console.error(`[Avatar] upload HTTP ${res.status}:`, body.slice(0, 300));
        }
        // Don't throw — preview stays, user is informed via console
        return;
      }

      const data = await res.json();
      if (data.avatar_url) setPhotoUri(data.avatar_url);
      if (__DEV__) console.log('[Avatar] uploaded:', data.avatar_url);
    } catch (err: any) {
      // Network error (offline, CORS, etc.)
      if (__DEV__) console.error('[Avatar] network error:', err?.message ?? err);
    } finally {
      setUploading(false);
    }
  };

  const handleCropConfirm = async (croppedDataUrl: string) => {
    setCropVisible(false);
    setPhotoUri(croppedDataUrl);
    // Convert data URL to Blob then File for upload
    try {
      const blob = await (await (window as any).fetch(croppedDataUrl)).blob();
      const file = new (window as any).File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await uploadAvatar(file);
    } catch {
      // Blob conversion failed — upload the data URL directly as a blob
      await uploadAvatar({ uri: croppedDataUrl, name: 'avatar.jpg', type: 'image/jpeg' } as any);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file: File | undefined = e.target?.files?.[0];
        if (!file) return;
        // Read as data URL → open crop modal (upload happens AFTER user confirms crop)
        const reader = new FileReader();
        reader.onload = (ev: any) => {
          const dataUrl: string = ev.target?.result;
          if (dataUrl) {
            setTempPath(dataUrl);
            setCropVisible(true);
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    // Mobile: expo-image-picker (allowsEditing gives built-in crop UI)
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('listing.permissionRequired'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      uploadAvatar({ uri, name: 'avatar.jpg', type: 'image/jpeg' });
    }
  };

  const save = async () => {
    if (!name.trim()) { Alert.alert(t('common.error'), t('errors.emptyName')); return; }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        city: city || undefined,
        bio:  (isLandlord ? bio : bio).trim() || undefined,
      };
      if (!isLandlord) {
        payload.age        = age ? parseInt(age, 10) : undefined;
        payload.university = uni.trim() || undefined;
      }
      if (isLandlord) {
        payload.phone = phone.trim() || undefined;
      }
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      if (city) setQuizCity(city);
      if (Platform.OS === 'web') {
        // Alert.alert is silent on web — notify + navigate directly
        (window as any).alert(t('profile.saved'));
        navigation.goBack();
      } else {
        Alert.alert(t('common.success'), t('profile.saved'), [
          { text: t('common.confirm'), onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const msg = getErrorMessage(err, t);
      if (Platform.OS === 'web') {
        (window as any).alert(msg);
      } else {
        Alert.alert(t('common.error'), msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── City picker (shared) ────────────────────────────────────────────────────
  const CityPicker = () => (
    <View style={st.section}>
      <Text style={st.label}>{t('profile.labelCity')}</Text>
      <TouchableOpacity
        style={[st.selectRow, city && st.selectRowActive]}
        onPress={() => setCityOpen(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={[st.selectTxt, city && st.selectTxtActive]}>
          {city || t('profile.cityPlaceholder')}
        </Text>
        <Text style={st.selectChev}>{cityOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {cityOpen && (
        <View style={st.dropdown}>
          <TextInput
            style={st.dropSearch}
            placeholder={t('profile.citySearch')}
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
  );

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>{t('profile.editTitle')}</Text>
        <View style={st.hBtn} />
      </View>

      <ScrollView
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar — tap to pick a photo */}
        <View style={st.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={st.avatarWrap} disabled={uploading}>
            {uploading ? (
              <View style={st.avatar}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={st.avatarImg} />
            ) : (
              <View style={st.avatar}>
                <Text style={st.avatarTxt}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={st.editBadge}>
              <Text style={{ fontSize: 13 }}>{uploading ? '⏳' : '✏️'}</Text>
            </View>
          </TouchableOpacity>
          <Text style={st.photoBtnHint}>{t('profile.photoChange')}</Text>
        </View>

        {/* Crop modal — web only; renders null on mobile */}
        {tempPath && (
          <PhotoCropperModal
            visible={cropVisible}
            imagePath={tempPath}
            onCropConfirm={handleCropConfirm}
            onCancel={() => { setCropVisible(false); setTempPath(null); }}
          />
        )}

        {isLandlord ? (
          // ── LANDLORD FORM ────────────────────────────────────────────────────
          <>
            {/* Ad / Şirket adı */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelCompanyOrName')}</Text>
              <TextInput
                style={st.input}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.nameLandlordPlaceholder')}
                placeholderTextColor={C.mute}
              />
            </View>

            {/* Telefon */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelPhone')}</Text>
              <TextInput
                style={st.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('profile.phonePlaceholder')}
                placeholderTextColor={C.mute}
                keyboardType="phone-pad"
              />
            </View>

            {/* Şehir */}
            <CityPicker />

            {/* Açıklama */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelDescription')}</Text>
              <TextInput
                style={[st.input, st.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder={t('profile.descPlaceholder')}
                placeholderTextColor={C.mute}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={st.charCount}>{bio.length}/500</Text>
            </View>
          </>
        ) : (
          // ── STUDENT FORM ─────────────────────────────────────────────────────
          <>
            {/* Ad */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelName')}</Text>
              <TextInput
                style={st.input}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={C.mute}
              />
            </View>

            {/* Yaş */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelAge')}</Text>
              <TextInput
                style={st.input}
                value={age}
                onChangeText={v => setAge(v.replace(/\D/g, '').slice(0, 2))}
                placeholder={t('profile.agePlaceholder')}
                placeholderTextColor={C.mute}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            {/* Şehir */}
            <CityPicker />

            {/* Üniversite */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelUniversity')}</Text>
              <TouchableOpacity
                style={[st.selectRow, uni && st.selectRowActive]}
                onPress={() => setUniOpen(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={[st.selectTxt, uni && st.selectTxtActive]} numberOfLines={1}>
                  {uni || t('profile.uniPlaceholder')}
                </Text>
                <Text style={st.selectChev}>{uniOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {uniOpen && (
                <View style={st.dropdown}>
                  <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                    <TouchableOpacity
                      style={st.dropItem}
                      onPress={() => { setUni(''); setUniOpen(false); }}
                    >
                      <Text style={st.dropItemTxt}>{t('profile.uniPlaceholder')}</Text>
                    </TouchableOpacity>
                    {UNIVERSITIES.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[st.dropItem, uni === u && st.dropItemActive]}
                        onPress={() => { setUni(u); setUniOpen(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[st.dropItemTxt, uni === u && st.dropItemTxtActive]} numberOfLines={2}>{u}</Text>
                        {uni === u && <Text style={st.dropCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Biyografi */}
            <View style={st.section}>
              <Text style={st.label}>{t('profile.labelBio')}</Text>
              <TextInput
                style={[st.input, st.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder={t('profile.bioPlaceholder')}
                placeholderTextColor={C.mute}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={st.charCount}>{bio.length}/300</Text>
            </View>
          </>
        )}

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
            : <Text style={st.saveTxt}>{t('profile.saveBtn')}</Text>}
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
  avatarWrap:   { position: 'relative', marginBottom: 10 },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: C.brandA,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  avatarImg:  { width: 84, height: 84, borderRadius: 42 },
  avatarTxt:  { color: '#fff', fontSize: 34, fontWeight: '800' },
  editBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.brandA,
    alignItems: 'center', justifyContent: 'center',
  },
  photoBtnHint: { color: C.mute, fontSize: 12, fontWeight: '500' },

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
