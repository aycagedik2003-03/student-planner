import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { filterService, type FilterOptions } from '../api/FilterService';
import { useT } from '../i18n/translations';

// ── Constants ─────────────────────────────────────────────────────────────────

const CITIES = ['Poznań', 'Kraków', 'Warszawa', 'Wrocław', 'Gdańsk'];

const ROOM_TYPES = [
  { id: 'single',    label: 'Single'    },
  { id: 'double',    label: 'Double'    },
  { id: 'shared',    label: 'Shared'    },
  { id: 'apartment', label: 'Apartment' },
] as const;

const AMENITIES = ['WiFi', 'Kitchen', 'Laundry', 'Parking', 'Garden', 'Balcony'];

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  visible:  boolean;
  onClose:  () => void;
  onApply:  (filters: FilterOptions) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FilterModalScreen({ visible, onClose, onApply }: Props) {
  const { t } = useT();

  const [city,          setCity]          = useState<string | null>(null);
  const [priceMin,      setPriceMin]      = useState(0);
  const [priceMax,      setPriceMax]      = useState(5000);
  const [roomTypes,     setRoomTypes]     = useState<string[]>([]);
  const [amenities,     setAmenities]     = useState<string[]>([]);
  const [ageMin,        setAgeMin]        = useState(18);
  const [ageMax,        setAgeMax]        = useState(65);
  const [cityExpanded,  setCityExpanded]  = useState(false);

  useEffect(() => {
    if (visible) loadFilters();
  }, [visible]);

  const loadFilters = async () => {
    try {
      const saved = await filterService.getFilters();
      setCity(saved.city ?? null);
      setPriceMin(saved.priceMin ?? 0);
      setPriceMax(saved.priceMax ?? 5000);
      setRoomTypes(saved.roomTypes  ?? []);
      setAmenities(saved.amenities  ?? []);
      setAgeMin(saved.ageMin ?? 18);
      setAgeMax(saved.ageMax ?? 65);
    } catch (err) {
      console.error('[FilterModal] Load error:', err);
    }
  };

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const handleApply = async () => {
    const filters: FilterOptions = {
      city,
      priceMin: priceMin > 0    ? priceMin : null,
      priceMax: priceMax < 5000 ? priceMax : null,
      roomTypes,
      amenities,
      ageMin: ageMin > 18 ? ageMin : null,
      ageMax: ageMax < 65 ? ageMax : null,
    };
    await filterService.saveFilters(filters);
    onApply(filters);
    onClose();
  };

  const handleReset = async () => {
    setCity(null);
    setPriceMin(0);
    setPriceMax(5000);
    setRoomTypes([]);
    setAmenities([]);
    setAgeMin(18);
    setAgeMax(65);
    setCityExpanded(false);
    await filterService.resetFilters();
    onApply({});
    onClose();
  };

  const activeCount = filterService.getActiveFilterCount({
    city, priceMin, priceMax, roomTypes, amenities, ageMin, ageMax,
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.headerBtn}>
            <Ionicons name="chevron-down" size={26} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{t('filters')}</Text>
            {activeCount > 0 && (
              <View style={s.activeBadge}>
                <Text style={s.activeBadgeText}>{activeCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleReset} style={s.headerBtn}>
            <Text style={s.headerReset}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* CITY */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('city')}</Text>
            <TouchableOpacity style={s.picker} onPress={() => setCityExpanded(e => !e)}>
              <Text style={s.pickerText}>{city || t('all')}</Text>
              <Ionicons name={cityExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
            </TouchableOpacity>

            {cityExpanded && (
              <View style={s.cityList}>
                <TouchableOpacity
                  style={[s.cityOption, !city && s.cityOptionOn]}
                  onPress={() => { setCity(null); setCityExpanded(false); }}
                >
                  <Text style={[s.cityOptionText, !city && s.cityOptionTextOn]}>{t('all')}</Text>
                  {!city && <Ionicons name="checkmark" size={16} color="#7C5CFF" />}
                </TouchableOpacity>
                {CITIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.cityOption, city === c && s.cityOptionOn]}
                    onPress={() => { setCity(c); setCityExpanded(false); }}
                  >
                    <Text style={[s.cityOptionText, city === c && s.cityOptionTextOn]}>{c}</Text>
                    {city === c && <Ionicons name="checkmark" size={16} color="#7C5CFF" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* PRICE RANGE */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('priceRange')} (PLN)</Text>
            <View style={s.rangeDisplay}>
              <Text style={s.rangeValue}>{priceMin.toLocaleString()}</Text>
              <Text style={s.rangeSep}>—</Text>
              <Text style={s.rangeValue}>{priceMax.toLocaleString()}</Text>
            </View>
            <View style={s.sliderRow}>
              <Text style={s.sliderLbl}>{t('min')}</Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={5000}
                step={100}
                value={priceMin}
                onValueChange={v => setPriceMin(Math.min(v, priceMax - 100))}
                minimumTrackTintColor="#7C5CFF"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#7C5CFF"
              />
              <Text style={s.sliderVal}>{priceMin}</Text>
            </View>
            <View style={s.sliderRow}>
              <Text style={s.sliderLbl}>{t('max')}</Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={5000}
                step={100}
                value={priceMax}
                onValueChange={v => setPriceMax(Math.max(v, priceMin + 100))}
                minimumTrackTintColor="#7C5CFF"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#7C5CFF"
              />
              <Text style={s.sliderVal}>{priceMax}</Text>
            </View>
          </View>

          {/* ROOM TYPES */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('roomType')}</Text>
            <View style={s.chipGrid}>
              {ROOM_TYPES.map(rt => (
                <TouchableOpacity
                  key={rt.id}
                  style={[s.chip, roomTypes.includes(rt.id) && s.chipOn]}
                  onPress={() => toggle(roomTypes, setRoomTypes, rt.id)}
                >
                  {roomTypes.includes(rt.id) && <Ionicons name="checkmark" size={15} color="#7C5CFF" />}
                  <Text style={[s.chipText, roomTypes.includes(rt.id) && s.chipTextOn]}>{rt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AMENITIES */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('amenities')}</Text>
            <View style={s.chipGrid}>
              {AMENITIES.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[s.chip, amenities.includes(a) && s.chipOn]}
                  onPress={() => toggle(amenities, setAmenities, a)}
                >
                  {amenities.includes(a) && <Ionicons name="checkmark" size={15} color="#7C5CFF" />}
                  <Text style={[s.chipText, amenities.includes(a) && s.chipTextOn]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AGE RANGE */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('ageRange')}</Text>
            <View style={s.rangeDisplay}>
              <Text style={s.rangeValue}>{ageMin}</Text>
              <Text style={s.rangeSep}>—</Text>
              <Text style={s.rangeValue}>{ageMax}</Text>
            </View>
            <View style={s.sliderRow}>
              <Text style={s.sliderLbl}>{t('min')}</Text>
              <Slider
                style={s.slider}
                minimumValue={18}
                maximumValue={65}
                step={1}
                value={ageMin}
                onValueChange={v => setAgeMin(Math.min(v, ageMax - 1))}
                minimumTrackTintColor="#7C5CFF"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#7C5CFF"
              />
              <Text style={s.sliderVal}>{ageMin}</Text>
            </View>
            <View style={s.sliderRow}>
              <Text style={s.sliderLbl}>{t('max')}</Text>
              <Slider
                style={s.slider}
                minimumValue={18}
                maximumValue={65}
                step={1}
                value={ageMax}
                onValueChange={v => setAgeMax(Math.max(v, ageMin + 1))}
                minimumTrackTintColor="#7C5CFF"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#7C5CFF"
              />
              <Text style={s.sliderVal}>{ageMax}</Text>
            </View>
          </View>

        </ScrollView>

        {/* FOOTER BUTTONS */}
        <View style={s.footer}>
          <TouchableOpacity style={s.btnReset} onPress={handleReset}>
            <Text style={s.btnResetText}>{t('reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnApply} onPress={handleApply}>
            <Text style={s.btnApplyText}>
              {t('apply')}{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBtn:    { padding: 8, minWidth: 44 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  headerReset:  { fontSize: 14, fontWeight: '600', color: '#7C5CFF', textAlign: 'right' },

  activeBadge: {
    backgroundColor: '#7C5CFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  activeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingVertical: 14, paddingBottom: 8 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },

  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerText: { fontSize: 14, color: '#333', fontWeight: '500' },

  cityList:        { marginTop: 8 },
  cityOption:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  cityOptionOn:    { backgroundColor: '#F5F3FF', marginHorizontal: -4, paddingHorizontal: 8, borderRadius: 6 },
  cityOptionText:  { fontSize: 14, color: '#555' },
  cityOptionTextOn:{ color: '#7C5CFF', fontWeight: '700' },

  rangeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  rangeValue: { fontSize: 18, fontWeight: '700', color: '#7C5CFF' },
  rangeSep:   { fontSize: 16, color: '#aaa' },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sliderLbl: { fontSize: 12, color: '#888', fontWeight: '600', width: 28 },
  slider:    { flex: 1, height: 32 },
  sliderVal: { fontSize: 12, color: '#999', fontWeight: '600', width: 38, textAlign: 'right' },

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

  footer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  btnReset: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnResetText: { fontWeight: '700', fontSize: 14, color: '#666' },
  btnApply: {
    flex: 2,
    backgroundColor: '#7C5CFF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnApplyText: { fontWeight: '700', fontSize: 14, color: '#fff' },
});
