import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { POLISH_CITIES } from '../constants/cities';
import { listingService } from '../api/ListingService';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListing'> };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD', pinkBg: '#FFF0F7',
};

type FeatureKey = 'furnished' | 'wifi' | 'ac' | 'parking' | 'elevator' | 'pets';
const FEATURES: { key: FeatureKey; icon: string; label: string }[] = [
  { key: 'furnished', icon: '🪑', label: 'Mobilyalı'    },
  { key: 'wifi',      icon: '📶', label: 'WiFi'          },
  { key: 'ac',        icon: '❄️', label: 'Klima'         },
  { key: 'parking',   icon: '🚗', label: 'Otopark'       },
  { key: 'elevator',  icon: '🛗', label: 'Asansör'       },
  { key: 'pets',      icon: '🐾', label: 'Evcil Hayvan'  },
];

// expo-image-picker loaded lazily to gracefully handle unavailability
let ImagePicker: typeof import('expo-image-picker') | null = null;
try { ImagePicker = require('expo-image-picker'); } catch {}

export default function CreateListingScreen({ navigation }: Props) {
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [title,       setTitle]       = useState('');
  const [city,        setCity]        = useState('');
  const [cityOpen,    setCityOpen]    = useState(false);
  const [cityQ,       setCityQ]       = useState('');
  const [address,     setAddress]     = useState('');
  const [price,       setPrice]       = useState('');
  const [rooms,       setRooms]       = useState(1);
  const [area,        setArea]        = useState('');
  const [description, setDescription] = useState('');
  const [features,    setFeatures]    = useState<Record<FeatureKey, boolean>>({
    furnished: false, wifi: false, ac: false, parking: false, elevator: false, pets: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const shownCities = POLISH_CITIES.filter(c => c.toLowerCase().includes(cityQ.toLowerCase()));
  const canPublish = address.trim() && city && price.trim() && Number(price) > 0 && !submitting;

  const pickPhotos = async () => {
    if (!ImagePicker) {
      Alert.alert('Mevcut değil', 'Fotoğraf seçici bu ortamda kullanılamıyor.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimine izin verin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 6));
    }
  };

  const toggleFeature = (key: FeatureKey) =>
    setFeatures(f => ({ ...f, [key]: !f[key] }));

  const publish = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (title.trim()) formData.append('title', title.trim());
      formData.append('address', address.trim());
      formData.append('city', city);
      formData.append('price', price);
      formData.append('rooms', String(rooms));
      if (area) formData.append('area', area);
      if (description.trim()) formData.append('description', description.trim());

      // Boolean features
      (Object.entries(features) as [FeatureKey, boolean][]).forEach(([key, val]) => {
        formData.append(key, val ? '1' : '0');
      });

      // Photos
      photos.forEach((uri, i) => {
        formData.append('photos', {
          uri,
          type: 'image/jpeg',
          name: `photo_${i}.jpg`,
        } as any);
      });

      await listingService.createListing(formData);

      Alert.alert(
        'İlan Yayınlandı! 🎉',
        `"${title || address}" ilanınız başarıyla eklendi.`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error   ??
        err?.message ??
        'Bir hata oluştu. Lütfen tekrar deneyin.';
      Alert.alert('Hata', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
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
        <Text style={st.hTitle}>İlan Ver</Text>
        <View style={st.hBtn} />
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Fotoğraflar ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>FOTOĞRAFLAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.photoRow}>
            {/* Existing photos */}
            {photos.map((uri, i) => (
              <View key={i} style={st.photoThumb}>
                <Text style={st.photoThumbTxt}>📷</Text>
                <TouchableOpacity
                  style={st.photoRemove}
                  onPress={() => setPhotos(p => p.filter((_, j) => j !== i))}
                >
                  <Text style={st.photoRemoveTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Add button */}
            {photos.length < 6 && (
              <TouchableOpacity style={st.photoAdd} onPress={pickPhotos} activeOpacity={0.7}>
                <Text style={st.photoAddIcon}>+</Text>
                <Text style={st.photoAddTxt}>Fotoğraf Ekle</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={st.photHint}>En fazla 6 fotoğraf yükleyebilirsiniz.</Text>
        </View>

        {/* ── İlan Başlığı ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>İLAN BAŞLIĞI — opsiyonel</Text>
          <TextInput
            style={st.input}
            placeholder="Örn: 2+1 Mobilyalı Daire"
            placeholderTextColor={C.mute}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
        </View>

        {/* ── Şehir ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>ŞEHİR</Text>
          <TouchableOpacity
            style={[st.selectPill, city && st.selectPillActive]}
            onPress={() => setCityOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={st.selectPillIcon}>📍</Text>
            <Text style={[st.selectPillTxt, city && st.selectPillTxtActive]}>
              {city || 'Şehir seçin...'}
            </Text>
            <Text style={st.selectChevron}>{cityOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {cityOpen && (
            <View style={st.dropdown}>
              <TextInput
                style={st.dropdownSearch}
                placeholder="Şehir ara..."
                placeholderTextColor={C.mute}
                value={cityQ}
                onChangeText={setCityQ}
              />
              <ScrollView style={st.dropdownList} nestedScrollEnabled>
                {shownCities.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[st.dropdownItem, city === c && st.dropdownItemActive]}
                    onPress={() => { setCity(c); setCityOpen(false); setCityQ(''); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[st.dropdownItemTxt, city === c && st.dropdownItemTxtActive]}>{c}</Text>
                    {city === c && <Text style={st.dropdownCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Adres ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>ADRES</Text>
          <TextInput
            style={st.input}
            placeholder="ul. Przykładowa 12/4"
            placeholderTextColor={C.mute}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* ── Fiyat ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>KİRA (PLN/AY)</Text>
          <View style={st.inputWithSuffix}>
            <TextInput
              style={[st.input, st.inputFlex]}
              placeholder="1800"
              placeholderTextColor={C.mute}
              value={price}
              onChangeText={t => setPrice(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            <View style={st.inputSuffix}>
              <Text style={st.inputSuffixTxt}>PLN/ay</Text>
            </View>
          </View>
        </View>

        {/* ── Oda sayısı ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>ODA SAYISI</Text>
          <View style={st.counter}>
            <TouchableOpacity
              style={[st.counterBtn, rooms <= 1 && st.counterBtnOff]}
              onPress={() => setRooms(r => Math.max(1, r - 1))}
              disabled={rooms <= 1}
              activeOpacity={0.7}
            >
              <Text style={st.counterBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={st.counterValue}>{rooms}</Text>
            <TouchableOpacity
              style={[st.counterBtn, rooms >= 6 && st.counterBtnOff]}
              onPress={() => setRooms(r => Math.min(6, r + 1))}
              disabled={rooms >= 6}
              activeOpacity={0.7}
            >
              <Text style={st.counterBtnTxt}>+</Text>
            </TouchableOpacity>
            <Text style={st.counterLabel}>oda</Text>
          </View>
        </View>

        {/* ── Metrekare ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>METREKAREi (m²) — opsiyonel</Text>
          <View style={st.inputWithSuffix}>
            <TextInput
              style={[st.input, st.inputFlex]}
              placeholder="50"
              placeholderTextColor={C.mute}
              value={area}
              onChangeText={t => setArea(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            <View style={st.inputSuffix}>
              <Text style={st.inputSuffixTxt}>m²</Text>
            </View>
          </View>
        </View>

        {/* ── Özellikler ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>ÖZELLİKLER</Text>
          <View style={st.featuresGrid}>
            {FEATURES.map(f => {
              const on = features[f.key];
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[st.featureChip, on && st.featureChipActive]}
                  onPress={() => toggleFeature(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={st.featureIcon}>{f.icon}</Text>
                  <Text style={[st.featureLabel, on && st.featureLabelActive]}>{f.label}</Text>
                  {on && <Text style={st.featureCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Açıklama ── */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>AÇIKLAMA — opsiyonel</Text>
          <TextInput
            style={[st.input, st.textarea]}
            placeholder="Dairenizi kısaca tanıtın..."
            placeholderTextColor={C.mute}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={st.charCount}>{description.length}/500</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Publish button ── */}
      <View style={st.footer}>
        <TouchableOpacity
          style={[st.publishBtn, (!canPublish || submitting) && st.publishBtnOff]}
          onPress={publish}
          disabled={!canPublish || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[st.publishTxt, !canPublish && st.publishTxtOff]}>
              {canPublish ? 'İlanı Yayınla ✓' : 'Zorunlu alanları doldurun'}
            </Text>
          )}
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
  hTitle: { color: C.ink, fontSize: 17, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16 },

  section: { marginBottom: 22 },
  sectionLabel: {
    color: C.mute, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10,
  },

  // Photos
  photoRow: { gap: 10 },
  photoThumb: {
    width: 72, height: 72, borderRadius: 14,
    backgroundColor: C.tealBg, borderWidth: 1.5, borderColor: C.brandA,
    alignItems: 'center', justifyContent: 'center',
  },
  photoThumbTxt: { fontSize: 28 },
  photoRemove: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 999,
    backgroundColor: C.brandB, alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  photoAdd: {
    width: 72, height: 72, borderRadius: 14,
    backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoAddIcon: { color: C.mute, fontSize: 24, fontWeight: '300', lineHeight: 28 },
  photoAddTxt:  { color: C.mute, fontSize: 9, textAlign: 'center' },
  photHint:     { color: C.mute, fontSize: 11, marginTop: 6 },

  // Select pill
  selectPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bgSoft, borderRadius: 14,
    borderWidth: 1, borderColor: C.line,
    paddingVertical: 14, paddingHorizontal: 14,
  },
  selectPillActive: { borderColor: C.brandA, backgroundColor: C.tealBg },
  selectPillIcon: { fontSize: 15 },
  selectPillTxt: { flex: 1, color: C.mute, fontSize: 15 },
  selectPillTxtActive: { color: C.ink, fontWeight: '600' },
  selectChevron: { color: C.mute, fontSize: 12 },

  // Dropdown
  dropdown: {
    backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    marginTop: 6, overflow: 'hidden',
    shadowColor: '#1F2937', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  dropdownSearch: {
    paddingHorizontal: 14, paddingVertical: 10,
    color: C.ink, fontSize: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  dropdownList: { maxHeight: 180 },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  dropdownItemActive: { backgroundColor: C.tealBg },
  dropdownItemTxt: { color: C.soft, fontSize: 14 },
  dropdownItemTxtActive: { color: C.ink, fontWeight: '700' },
  dropdownCheck: { color: C.brandA, fontWeight: '800' },

  // Inputs
  input: {
    backgroundColor: C.bgSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    paddingVertical: 13, paddingHorizontal: 14,
    color: C.ink, fontSize: 15,
  },
  inputFlex:      { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  inputWithSuffix: { flexDirection: 'row', alignItems: 'stretch' },
  inputSuffix: {
    backgroundColor: C.tealBg, borderRadius: 14, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
    borderWidth: 1, borderLeftWidth: 0, borderColor: C.brandA,
    paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
  },
  inputSuffixTxt: { color: C.tealTx, fontSize: 13, fontWeight: '700' },
  textarea:   { minHeight: 100, paddingTop: 12 },
  charCount:  { color: C.mute, fontSize: 10, textAlign: 'right', marginTop: 4 },

  // Rooms counter
  counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 38, height: 38, borderRadius: 999,
    backgroundColor: C.tealBg, borderWidth: 1.5, borderColor: C.brandA,
    alignItems: 'center', justifyContent: 'center',
  },
  counterBtnOff: { backgroundColor: C.bgSoft, borderColor: C.line },
  counterBtnTxt: { color: C.brandA, fontSize: 22, fontWeight: '700', lineHeight: 26 },
  counterValue:  { color: C.ink, fontSize: 28, fontWeight: '800', minWidth: 36, textAlign: 'center' },
  counterLabel:  { color: C.mute, fontSize: 14 },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 14,
    borderRadius: 999, borderWidth: 1.5,
    backgroundColor: C.bgSoft, borderColor: C.line,
  },
  featureChipActive: { backgroundColor: C.tealBg, borderColor: C.brandA },
  featureIcon:  { fontSize: 14 },
  featureLabel: { color: C.soft, fontSize: 13, fontWeight: '500' },
  featureLabelActive: { color: C.tealTx, fontWeight: '700' },
  featureCheck: { color: C.brandA, fontSize: 12, fontWeight: '800' },

  // Footer
  footer: { paddingHorizontal: 18, paddingBottom: 20, paddingTop: 12, backgroundColor: C.bg },
  publishBtn: {
    backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  publishBtnOff: { backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, shadowOpacity: 0, elevation: 0 },
  publishTxt:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  publishTxtOff: { color: C.mute },
});
