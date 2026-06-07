import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listingService } from '../api/ListingService';
import { useT } from '../i18n/translations';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListing'>;
};

const ROOM_TYPES = ['single', 'double', 'shared', 'apartment'] as const;
type RoomType = typeof ROOM_TYPES[number];

const CITIES     = ['Poznań', 'Kraków', 'Warszawa', 'Wrocław', 'Gdańsk'];
const AMENITIES  = ['WiFi', 'Kitchen', 'Laundry', 'Parking', 'Garden', 'Balcony'];
const RULES_LIST = ['No smoking', 'No pets', 'Quiet hours 22:00-08:00'];

export default function CreateListingScreen({ navigation }: Props) {
  const { t } = useT();
  const insets = useSafeAreaInsets();

  // Form state
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [city,        setCity]        = useState('Poznań');
  const [address,     setAddress]     = useState('');
  const [priceMin,    setPriceMin]    = useState('');
  const [priceMax,    setPriceMax]    = useState('');
  const [roomType,    setRoomType]    = useState<RoomType>('single');
  const [bedrooms,    setBedrooms]    = useState('1');
  const [bathrooms,   setBathrooms]   = useState('1');
  const [amenities,   setAmenities]   = useState<string[]>([]);
  const [rules,       setRules]       = useState<string[]>([]);
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [moveInDate,  setMoveInDate]  = useState(new Date());
  const [contractLen, setContractLen] = useState('12');

  // UI state
  const [showDate,       setShowDate]       = useState(false);
  const [cityModal,      setCityModal]      = useState(false);
  const [roomTypeModal,  setRoomTypeModal]  = useState(false);
  const [saving,         setSaving]         = useState(false);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('listing.permissionRequired'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (err) {
      console.error('[CreateListing] Photo error:', err);
      Alert.alert(t('common.error'), t('photoError'));
    }
  };

  const validate = (): boolean => {
    if (!title.trim())        { Alert.alert(t('common.error'), t('validation.titleRequired'));       return false; }
    if (!description.trim())  { Alert.alert(t('common.error'), t('validation.descRequired'));        return false; }
    if (!priceMin || !priceMax) { Alert.alert(t('common.error'), t('validation.priceRequired'));     return false; }
    if (parseInt(priceMin) > parseInt(priceMax)) {
      Alert.alert(t('common.error'), t('validation.priceOrder'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await listingService.createListing({
        title,
        description,
        city,
        address,
        price_min:       parseInt(priceMin),
        price_max:       parseInt(priceMax),
        room_type:       roomType,
        bedrooms:        parseInt(bedrooms),
        bathrooms:       parseInt(bathrooms),
        photos,
        amenities,
        rules,
        move_in_date:    moveInDate.toISOString().split('T')[0],
        contract_length: parseInt(contractLen),
      });
      Alert.alert(t('common.success'), t('listingCreated'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('[CreateListing] Error:', err);
      Alert.alert(t('common.error'), t('common.tryAgain'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('createListing')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* FORM */}
      <ScrollView style={s.form} contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">

        {/* BAŞLIK */}
        <View style={s.section}>
          <Text style={s.label}>{t('title')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholderTextColor="#aaa"
          />
          <Text style={s.charCount}>{title.length}/100</Text>
        </View>

        {/* AÇIKLAMA */}
        <View style={s.section}>
          <Text style={s.label}>{t('description')}</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            placeholderTextColor="#aaa"
          />
          <Text style={s.charCount}>{description.length}/500</Text>
        </View>

        {/* ŞEHİR */}
        <View style={s.section}>
          <Text style={s.label}>{t('city')}</Text>
          <TouchableOpacity style={s.picker} onPress={() => setCityModal(true)}>
            <Text style={s.pickerText}>{city}</Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ADRES */}
        <View style={s.section}>
          <Text style={s.label}>{t('address')}</Text>
          <TextInput
            style={s.input}
            placeholder="ul. Poznańska 15, apt 3"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* FİYAT ARALIĞI */}
        <View style={s.section}>
          <Text style={s.label}>{t('priceRange')}</Text>
          <View style={s.priceRow}>
            <TextInput
              style={[s.input, s.priceInput]}
              placeholder="Min"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="number-pad"
              placeholderTextColor="#aaa"
            />
            <Text style={s.priceSep}>–</Text>
            <TextInput
              style={[s.input, s.priceInput]}
              placeholder="Max"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="number-pad"
              placeholderTextColor="#aaa"
            />
            <Text style={s.priceCurrency}>PLN</Text>
          </View>
        </View>

        {/* ODA TİPİ */}
        <View style={s.section}>
          <Text style={s.label}>{t('roomType')}</Text>
          <TouchableOpacity style={s.picker} onPress={() => setRoomTypeModal(true)}>
            <Text style={s.pickerText}>{roomType.charAt(0).toUpperCase() + roomType.slice(1)}</Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* YATAK / BANYO */}
        <View style={s.section}>
          <View style={s.twoCol}>
            <View style={s.twoColItem}>
              <Text style={s.label}>{t('bedrooms')}</Text>
              <TextInput style={s.input} value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
            </View>
            <View style={s.twoColItem}>
              <Text style={s.label}>{t('bathrooms')}</Text>
              <TextInput style={s.input} value={bathrooms} onChangeText={setBathrooms} keyboardType="number-pad" />
            </View>
          </View>
        </View>

        {/* OLANAKLAR */}
        <View style={s.section}>
          <Text style={s.label}>{t('amenities')}</Text>
          <View style={s.chipGrid}>
            {AMENITIES.map(a => (
              <TouchableOpacity
                key={a}
                style={[s.chip, amenities.includes(a) && s.chipOn]}
                onPress={() => toggleItem(amenities, setAmenities, a)}
              >
                {amenities.includes(a) && <Ionicons name="checkmark" size={16} color="#7C5CFF" />}
                <Text style={[s.chipText, amenities.includes(a) && s.chipTextOn]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KURALLAR */}
        <View style={s.section}>
          <Text style={s.label}>{t('rules')}</Text>
          <View style={s.chipGrid}>
            {RULES_LIST.map(r => (
              <TouchableOpacity
                key={r}
                style={[s.chip, rules.includes(r) && s.chipOn]}
                onPress={() => toggleItem(rules, setRules, r)}
              >
                {rules.includes(r) && <Ionicons name="checkmark" size={16} color="#7C5CFF" />}
                <Text style={[s.chipText, rules.includes(r) && s.chipTextOn]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FOTOĞRAFLAR */}
        <View style={s.section}>
          <Text style={s.label}>{t('photos')}</Text>
          <TouchableOpacity style={s.photoBtn} onPress={pickPhoto}>
            <Ionicons name="image-outline" size={24} color="#7C5CFF" />
            <Text style={s.photoBtnText}>{t('addPhoto')} ({photos.length})</Text>
          </TouchableOpacity>
          {photos.length > 0 && (
            <FlatList
              data={photos}
              horizontal
              style={{ marginTop: 10 }}
              renderItem={({ item, index }) => (
                <View style={s.photoThumb}>
                  <Image source={{ uri: item }} style={s.photoImg} />
                  <TouchableOpacity
                    style={s.photoRemove}
                    onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(_, i) => i.toString()}
            />
          )}
        </View>

        {/* GİRİŞ TARİHİ */}
        <View style={s.section}>
          <Text style={s.label}>{t('moveInDate')}</Text>
          <TouchableOpacity style={s.picker} onPress={() => setShowDate(true)}>
            <Text style={s.pickerText}>{moveInDate.toLocaleDateString('tr-TR')}</Text>
            <Ionicons name="calendar-outline" size={20} color="#999" />
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={moveInDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                setShowDate(false);
                if (date) setMoveInDate(date);
              }}
            />
          )}
        </View>

        {/* KONTRAT SÜRESİ */}
        <View style={s.section}>
          <Text style={s.label}>{t('contractLength')}</Text>
          <TextInput
            style={s.input}
            value={contractLen}
            onChangeText={setContractLen}
            keyboardType="number-pad"
          />
        </View>

        {/* KAYDET */}
        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>{t('createListing')}</Text>}
        </TouchableOpacity>

      </ScrollView>

      {/* ŞEHİR MODAL */}
      <Modal visible={cityModal} transparent animationType="slide">
        <View style={s.modalWrap}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setCityModal(false)}>
              <Text style={s.modalDone}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.modalItem} onPress={() => { setCity(item); setCityModal(false); }}>
                <Text style={[s.modalItemText, city === item && s.modalItemSelected]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* ODA TİPİ MODAL */}
      <Modal visible={roomTypeModal} transparent animationType="slide">
        <View style={s.modalWrap}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setRoomTypeModal(false)}>
              <Text style={s.modalDone}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ROOM_TYPES as unknown as string[]}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.modalItem}
                onPress={() => { setRoomType(item as RoomType); setRoomTypeModal(false); }}
              >
                <Text style={[s.modalItemText, roomType === item && s.modalItemSelected]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },

  form:        { flex: 1 },
  formContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 },

  section:   { marginBottom: 20 },
  label:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  charCount: { fontSize: 11, color: '#999', marginTop: 4, textAlign: 'right' },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a1a2e',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: { fontSize: 14, color: '#1a1a2e', fontWeight: '500' },

  priceRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInput:   { flex: 1 },
  priceSep:     { fontSize: 16, color: '#999' },
  priceCurrency:{ fontSize: 13, color: '#666', fontWeight: '600', width: 36 },

  twoCol:     { flexDirection: 'row', gap: 12 },
  twoColItem: { flex: 1 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chipOn:      { backgroundColor: '#F5F3FF', borderColor: '#7C5CFF' },
  chipText:    { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextOn:  { color: '#7C5CFF', fontWeight: '700' },

  photoBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7C5CFF',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoBtnText: { fontSize: 14, color: '#7C5CFF', fontWeight: '600' },
  photoThumb:   { position: 'relative', width: 96, height: 96, marginRight: 8 },
  photoImg:     { width: '100%', height: '100%', borderRadius: 8 },
  photoRemove: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: '#FF6B6B', borderRadius: 11, padding: 3,
  },

  saveBtn: {
    backgroundColor: '#7C5CFF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },

  modalWrap: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: '50%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-end',
  },
  modalDone:         { fontSize: 16, fontWeight: '700', color: '#7C5CFF' },
  modalItem:         { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalItemText:     { fontSize: 16, color: '#555' },
  modalItemSelected: { color: '#7C5CFF', fontWeight: '700' },
});
