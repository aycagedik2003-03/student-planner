import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore, Filters, DEFAULT_FILTERS, isFiltersActive } from '../store';
import { POLISH_CITIES } from '../constants/cities';
import { filterService } from '../api/FilterService';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Filter'> };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD', pinkBg: '#FFF0F7',
  star: '#F59E0B', starBg: '#FFF7E6',
};

// ── Pure range-slider helpers ─────────────────────────────────────────────────
const valToPx = (v: number, tw: number, mn: number, mx: number) =>
  tw > 0 ? ((v - mn) / (mx - mn)) * tw : 0;
const pxToVal = (px: number, tw: number, mn: number, mx: number, st: number) => {
  const raw = mn + (Math.min(Math.max(px, 0), tw) / tw) * (mx - mn);
  return Math.round(raw / st) * st;
};

// ── Dual-range slider ─────────────────────────────────────────────────────────
import { useRef, useEffect } from 'react';

type RSProps = {
  minVal: number; maxVal: number; step: number;
  low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
  format: (v: number) => string;
};

function RangeSlider({ minVal, maxVal, step, low, high, onLowChange, onHighChange, format }: RSProps) {
  const [tw, setTw] = useState(0);
  const twRef  = useRef(0);
  const lowRef = useRef(low);
  const hiRef  = useRef(high);
  const onLRef = useRef(onLowChange);
  const onHRef = useRef(onHighChange);
  const lowSX  = useRef(0);
  const hiSX   = useRef(0);

  useEffect(() => { lowRef.current = low; },         [low]);
  useEffect(() => { hiRef.current  = high; },        [high]);
  useEffect(() => { onLRef.current = onLowChange; }, [onLowChange]);
  useEffect(() => { onHRef.current = onHighChange; },[onHighChange]);

  const lowPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { lowSX.current = valToPx(lowRef.current, twRef.current, minVal, maxVal); },
    onPanResponderMove: (_, g) => {
      const sp = twRef.current * step / (maxVal - minVal);
      const cap = valToPx(hiRef.current, twRef.current, minVal, maxVal) - sp;
      onLRef.current(pxToVal(Math.max(0, Math.min(lowSX.current + g.dx, cap)), twRef.current, minVal, maxVal, step));
    },
  })).current;

  const hiPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { hiSX.current = valToPx(hiRef.current, twRef.current, minVal, maxVal); },
    onPanResponderMove: (_, g) => {
      const sp    = twRef.current * step / (maxVal - minVal);
      const floor = valToPx(lowRef.current, twRef.current, minVal, maxVal) + sp;
      onHRef.current(pxToVal(Math.max(floor, Math.min(hiSX.current + g.dx, twRef.current)), twRef.current, minVal, maxVal, step));
    },
  })).current;

  const lowX = valToPx(low, tw, minVal, maxVal);
  const hiX  = valToPx(high, tw, minVal, maxVal);

  return (
    <View style={s.rsl}>
      <View style={s.rslLabels}>
        <View style={s.rslLblBox}><Text style={s.rslLbl}>{format(low)}</Text></View>
        <View style={s.rslLblBox}><Text style={s.rslLbl}>{format(high)}</Text></View>
      </View>
      <View style={s.rslWrap} onLayout={e => { twRef.current = e.nativeEvent.layout.width; setTw(e.nativeEvent.layout.width); }}>
        <View style={s.rslBg} />
        <View style={[s.rslFill, { left: lowX, width: Math.max(hiX - lowX, 0) }]} />
        <View style={[s.rslThumb, { left: lowX - 13 }]} {...lowPan.panHandlers} />
        <View style={[s.rslThumb, { left: hiX  - 13 }]} {...hiPan.panHandlers} />
      </View>
    </View>
  );
}

// ── Chip group ────────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({ options, value, onChange }: {
  options: readonly T[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <View style={s.chipRow}>
      {options.map(opt => {
        const sel = opt === value;
        return (
          <TouchableOpacity key={opt} style={[s.chip, sel && s.chipSel]} onPress={() => onChange(opt)} activeOpacity={0.7}>
            <Text style={[s.chipTxt, sel && s.chipTxtSel]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function FilterScreen({ navigation }: Props) {
  const { filters: saved, setFilters, setFilteredMatches, clearFilteredMatches } = useAppStore();
  const [local,    setLocal]    = useState<Filters>({ ...saved });
  const [applying, setApplying] = useState(false);

  const upd = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setLocal(f => ({ ...f, [key]: val }));

  // City modal
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQ,    setCityQ]    = useState('');
  const [tempCity, setTempCity] = useState<string | null>(local.city);

  const shownCities = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(cityQ.toLowerCase()),
  );

  const confirmCity = () => { upd('city', tempCity); setCityOpen(false); setCityQ(''); };

  const apply = async () => {
    setApplying(true);
    try {
      if (isFiltersActive(local)) {
        const results = await filterService.getMatches(local);
        setFilteredMatches(results);
      } else {
        clearFilteredMatches();
      }
    } catch {
      // API hatası → client-side filtreleme devam eder
      clearFilteredMatches();
    } finally {
      setApplying(false);
    }
    setFilters(local);
    navigation.goBack();
  };

  const reset = () => {
    setLocal({ ...DEFAULT_FILTERS });
    clearFilteredMatches();
    setFilters({ ...DEFAULT_FILTERS });
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.hTitle}>Filtreler</Text>
        <View style={s.hBtn} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Şehir ── */}
        <Section label="Şehir">
          <TouchableOpacity
            style={[s.cityPill, local.city && s.cityPillActive]}
            onPress={() => { setTempCity(local.city); setCityOpen(true); }}
            activeOpacity={0.8}
          >
            <Text style={s.cityIcon}>📍</Text>
            <Text style={[s.cityTxt, local.city && s.cityTxtActive]}>{local.city ?? 'Şehir seçin...'}</Text>
            {local.city
              ? <TouchableOpacity onPress={() => upd('city', null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={s.cityClear}>✕</Text>
                </TouchableOpacity>
              : <Text style={s.cityChev}>›</Text>}
          </TouchableOpacity>
        </Section>

        {/* ── Bütçe ── */}
        <Section label="Bütçe / Kira (PLN/ay)">
          <RangeSlider
            minVal={500} maxVal={5000} step={100}
            low={local.budgetMin} high={local.budgetMax}
            onLowChange={v => upd('budgetMin', v)}
            onHighChange={v => upd('budgetMax', v)}
            format={v => `${v} PLN`}
          />
        </Section>

        {/* ── Yaş ── */}
        <Section label="Yaş Aralığı">
          <RangeSlider
            minVal={18} maxVal={35} step={1}
            low={local.ageMin} high={local.ageMax}
            onLowChange={v => upd('ageMin', v)}
            onHighChange={v => upd('ageMax', v)}
            format={v => `${v}`}
          />
        </Section>

        {/* ── Cinsiyet ── */}
        <Section label="Cinsiyet Tercihi">
          <ChipGroup
            options={['Kadın', 'Erkek', 'Fark etmez'] as const}
            value={local.gender}
            onChange={v => upd('gender', v)}
          />
        </Section>

        {/* ── Uyku düzeni ── */}
        <Section label="Uyku Düzeni">
          <ChipGroup
            options={['Gece kuşu', 'Orta', 'Erken', 'Fark etmez'] as const}
            value={local.sleepPattern}
            onChange={v => upd('sleepPattern', v)}
          />
        </Section>

        {/* ── Temizlik ── */}
        <Section label="Temizlik (minimum)">
          <View style={s.starWrap}>
            <View style={s.starRow}>
              {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= local.cleanlinessMin;
                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => upd('cleanlinessMin', local.cleanlinessMin === star ? 0 : star)}
                    activeOpacity={0.7}
                    style={[s.starBtn, filled && s.starBtnActive]}
                  >
                    <Text style={[s.starTxt, filled && s.starTxtActive]}>
                      {filled ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={s.starHint}>
              {local.cleanlinessMin === 0
                ? 'Fark etmez'
                : `${local.cleanlinessMin} yıldız ve üzeri`}
            </Text>
          </View>
        </Section>

        {/* ── Sigara ── */}
        <Section label="Sigara">
          <ChipGroup
            options={['İçer', 'İçmez', 'Fark etmez'] as const}
            value={local.smoking}
            onChange={v => upd('smoking', v)}
          />
        </Section>

        {/* ── Alkol ── */}
        <Section label="Alkol">
          <ChipGroup
            options={['İçer', 'İçmez', 'Fark etmez'] as const}
            value={local.alcohol}
            onChange={v => upd('alcohol', v)}
          />
        </Section>

        {/* ── Evcil hayvan ── */}
        <Section label="Evcil Hayvan">
          <ChipGroup
            options={['Var', 'Yok', 'Fark etmez'] as const}
            value={local.pet}
            onChange={v => upd('pet', v)}
          />
        </Section>

        {/* ── Diyet ── */}
        <Section label="Diyet">
          <ChipGroup
            options={['Vegan', 'Vejeteryan', 'Helal', 'Normal', 'Fark etmez'] as const}
            value={local.diet}
            onChange={v => upd('diet', v)}
          />
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Footer: iki buton ── */}
      <View style={s.footer}>
        <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.7}>
          <Text style={s.resetTxt}>Sıfırla</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applyBtn, applying && s.applyBtnDisabled]}
          onPress={apply}
          activeOpacity={0.85}
          disabled={applying}
        >
          {applying
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.applyTxt}>Uygula</Text>}
        </TouchableOpacity>
      </View>

      {/* ── Şehir Modal ── */}
      <Modal visible={cityOpen} transparent animationType="slide" onRequestClose={() => setCityOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Şehir Seç</Text>
              <TouchableOpacity onPress={() => setCityOpen(false)} activeOpacity={0.7}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.searchWrap}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Şehir ara..."
                placeholderTextColor={C.mute}
                value={cityQ}
                onChangeText={setCityQ}
                autoFocus
              />
              {cityQ.length > 0 && (
                <TouchableOpacity onPress={() => setCityQ('')} activeOpacity={0.7}>
                  <Text style={s.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={shownCities}
              keyExtractor={item => item}
              style={s.cityList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const sel = tempCity === item;
                return (
                  <TouchableOpacity
                    style={[s.cityItem, sel && s.cityItemSel]}
                    onPress={() => setTempCity(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.cityItemTxt, sel && s.cityItemTxtSel]}>{item}</Text>
                    {sel && <Text style={s.cityItemCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={[s.modalConfirm, !tempCity && s.modalConfirmOff]}
              onPress={confirmCity}
              disabled={!tempCity}
              activeOpacity={0.85}
            >
              <Text style={[s.modalConfirmTxt, !tempCity && s.modalConfirmTxtOff]}>
                {tempCity ? `${tempCity} Seçildi` : 'Şehir Seçin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
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
  hTitle:  { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16 },

  section: { marginBottom: 26 },
  sLabel:  {
    color: C.mute, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12,
  },

  // City pill
  cityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bgSoft, borderRadius: 14,
    borderWidth: 1, borderColor: C.line,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  cityPillActive: { borderColor: C.brandA, backgroundColor: C.tealBg },
  cityIcon: { fontSize: 15 },
  cityTxt:  { flex: 1, color: C.mute, fontSize: 15, fontWeight: '500' },
  cityTxtActive: { color: C.ink, fontWeight: '600' },
  cityClear: { color: C.mute, fontSize: 13, fontWeight: '700' },
  cityChev:  { color: C.mute, fontSize: 18 },

  // Range slider
  rsl: { paddingVertical: 4 },
  rslLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  rslLblBox: {
    backgroundColor: C.bgSoft, borderRadius: 8, borderWidth: 1, borderColor: C.line,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  rslLbl:  { color: C.ink, fontSize: 13, fontWeight: '700' },
  rslWrap: { height: 42, position: 'relative' },
  rslBg:   {
    position: 'absolute', top: 19, left: 0, right: 0,
    height: 4, backgroundColor: '#E5E7EB', borderRadius: 999,
  },
  rslFill: {
    position: 'absolute', top: 19, height: 4,
    backgroundColor: C.brandA, borderRadius: 999,
  },
  rslThumb: {
    position: 'absolute', top: 8,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: C.brandA,
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:    {
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999,
    borderWidth: 1.5, backgroundColor: C.bgSoft, borderColor: C.line,
  },
  chipSel:    { backgroundColor: C.tealBg, borderColor: C.brandA },
  chipTxt:    { color: C.soft, fontSize: 13.5, fontWeight: '500' },
  chipTxtSel: { color: C.tealTx, fontWeight: '700' },

  // Stars
  starWrap: { gap: 10 },
  starRow:  { flexDirection: 'row', gap: 8 },
  starBtn:  {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  starBtnActive: { backgroundColor: C.starBg, borderColor: C.star },
  starTxt:       { fontSize: 22, color: '#D1D5DB' },
  starTxtActive: { color: C.star },
  starHint:      { color: C.mute, fontSize: 12, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 18, paddingBottom: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg,
  },
  resetBtn: {
    flex: 1, borderRadius: 999, paddingVertical: 17, alignItems: 'center',
    backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line,
  },
  resetTxt: { color: C.soft, fontSize: 15, fontWeight: '600' },
  applyBtn: {
    flex: 2, borderRadius: 999, paddingVertical: 17, alignItems: 'center',
    backgroundColor: C.brandA,
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38, shadowRadius: 12, elevation: 6,
  },
  applyBtnDisabled: { opacity: 0.7, shadowOpacity: 0 },
  applyTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,18,30,0.55)', justifyContent: 'flex-end', alignItems: 'center' },
  modalCard: {
    width: '100%', maxWidth: 480,
    backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 20, paddingBottom: 28, maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 14,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 14,
  },
  modalTitle: { color: C.ink, fontSize: 17, fontWeight: '800' },
  modalClose: { color: C.mute, fontSize: 18, fontWeight: '700', padding: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: C.bgSoft, borderRadius: 14,
    borderWidth: 1, borderColor: C.line,
    paddingVertical: 11, paddingHorizontal: 14,
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, color: C.ink, fontSize: 15, padding: 0 },
  searchClear: { color: C.mute, fontSize: 13, fontWeight: '700' },
  cityList:    { marginHorizontal: 16, marginBottom: 12 },
  cityItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
  },
  cityItemSel:    { backgroundColor: C.tealBg, borderColor: C.brandA },
  cityItemTxt:    { color: C.soft, fontSize: 15, fontWeight: '500' },
  cityItemTxtSel: { color: C.ink, fontWeight: '700' },
  cityItemCheck:  { color: C.brandA, fontSize: 14, fontWeight: '800' },
  modalConfirm: {
    marginHorizontal: 16, borderRadius: 999, backgroundColor: C.brandA,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  modalConfirmOff: {
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, shadowOpacity: 0, elevation: 0,
  },
  modalConfirmTxt:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalConfirmTxtOff: { color: C.mute },
});
