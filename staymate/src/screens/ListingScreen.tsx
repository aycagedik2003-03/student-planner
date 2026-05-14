import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  FlatList, ScrollView, ActivityIndicator, Image, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../../App';
import { LISTINGS, type Listing } from '../data/listings';
import { listingService } from '../api/ListingService';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Listings'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Props = { navigation: NavProp };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD', pinkBg: '#FFF0F7', pinkTx: '#F06EB1',
};

const CITIES = ['Tümü', 'Kraków', 'Warszawa', 'Poznań', 'Wrocław', 'Gdańsk', 'Łódź'];
const PRICE_FILTERS = [
  { label: 'Tümü',          min: 0,    max: Infinity },
  { label: '< 1500 PLN',    min: 0,    max: 1500     },
  { label: '1500–2500 PLN', min: 1500, max: 2500     },
  { label: '> 2500 PLN',    min: 2500, max: Infinity },
];

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/'); }

// ── Listing card ──────────────────────────────────────────────────────────────
const ListingCard = React.memo(function ListingCard({
  item, onPress,
}: { item: Listing; onPress: () => void }) {
  const photo = item.photos[0];
  return (
    <TouchableOpacity style={st.card} onPress={onPress} activeOpacity={0.8}>
      <View style={st.photoWrap}>
        {isUrl(photo) ? (
          <Image source={{ uri: photo }} style={st.photoImg} resizeMode="cover" />
        ) : (
          <View style={[st.photoSwatch, { backgroundColor: photo }]}>
            <Text style={st.photoIcon}>🏠</Text>
          </View>
        )}
        {item.furnished && (
          <View style={st.furnishedBadge}>
            <Text style={st.furnishedTxt}>Mobilyalı</Text>
          </View>
        )}
      </View>

      <View style={st.cardInfo}>
        <Text style={st.cardAddress} numberOfLines={1}>{item.address}</Text>
        <Text style={st.cardDistrict}>
          {[item.district, item.city].filter(Boolean).join(' · ') || '—'}
        </Text>
        <View style={st.cardMeta}>
          <View style={st.metaChip}><Text style={st.metaChipTxt}>{item.rooms} oda</Text></View>
          {item.area > 0 && <View style={st.metaChip}><Text style={st.metaChipTxt}>{item.area} m²</Text></View>}
          {item.wifi && <View style={st.metaChip}><Text style={st.metaChipTxt}>📶 WiFi</Text></View>}
        </View>
        <Text style={st.cardPrice}>
          {item.price.toLocaleString('tr-TR')} <Text style={st.cardPriceSub}>PLN/ay</Text>
        </Text>
      </View>

      <Text style={st.chevron}>›</Text>
    </TouchableOpacity>
  );
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ListingScreen({ navigation }: Props) {
  const [allListings, setAllListings] = useState<Listing[]>(LISTINGS);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [usingLocal,  setUsingLocal]  = useState(false);

  const [search,   setSearch]   = useState('');
  const [city,     setCity]     = useState('Tümü');
  const [priceIdx, setPriceIdx] = useState(0);

  const fetchListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await listingService.getListings();
      setAllListings(data.length > 0 ? data : LISTINGS);
      setUsingLocal(data.length === 0);
    } catch {
      setAllListings(LISTINGS);
      setUsingLocal(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filtered = useMemo(() => {
    const p = PRICE_FILTERS[priceIdx];
    const q = search.toLowerCase();
    return allListings.filter(l =>
      (city === 'Tümü' || l.city === city) &&
      l.price >= p.min && l.price <= p.max &&
      (!q || l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q))
    );
  }, [allListings, city, priceIdx, search]);

  const handleCardPress = useCallback((id: string) => {
    navigation.navigate('ListingDetail', { listingId: id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Listing }) => (
    <ListingCard item={item} onPress={() => handleCardPress(item.id)} />
  ), [handleCardPress]);

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={st.header}>
        <Text style={st.hTitle}>İlanlar</Text>
        <TouchableOpacity
          style={st.addBtn}
          onPress={() => navigation.navigate('CreateListing')}
          activeOpacity={0.8}
        >
          <Text style={st.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={st.searchWrap}>
        <Text style={st.searchIcon}>🔍</Text>
        <TextInput
          style={st.searchInput}
          placeholder="Adres veya şehir ara..."
          placeholderTextColor={C.mute}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <Text style={st.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
        {CITIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[st.filterChip, city === c && st.filterChipActive]}
            onPress={() => setCity(c)}
            activeOpacity={0.7}
          >
            <Text style={[st.filterChipTxt, city === c && st.filterChipTxtActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={[st.filterRow, { paddingTop: 0, paddingBottom: 8 }]}>
        {PRICE_FILTERS.map((p, i) => (
          <TouchableOpacity
            key={p.label}
            style={[st.filterChipSm, priceIdx === i && st.filterChipSmActive]}
            onPress={() => setPriceIdx(i)}
            activeOpacity={0.7}
          >
            <Text style={[st.filterChipSmTxt, priceIdx === i && st.filterChipSmTxtActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={st.resultRow}>
        <Text style={st.resultTxt}>{filtered.length} ilan bulundu</Text>
        {usingLocal && (
          <View style={st.offlinePill}>
            <Text style={st.offlineTxt}>● Çevrimdışı</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>İlanlar yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchListings(true); }}
          ListEmptyComponent={
            <View style={st.empty}>
              <Text style={st.emptyIcon}>🏠</Text>
              <Text style={st.emptyTitle}>İlan bulunamadı</Text>
              <Text style={st.emptySub}>Farklı filtreler deneyin.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  hTitle: { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  addBtn: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  addBtnTxt: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: C.bgSoft, borderRadius: 14,
    borderWidth: 1, borderColor: C.line,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, color: C.ink, fontSize: 14, padding: 0 },
  searchClear: { color: C.mute, fontSize: 13, fontWeight: '700', paddingLeft: 4 },

  filterRow: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line,
  },
  filterChipActive:    { backgroundColor: C.tealBg, borderColor: C.brandA },
  filterChipTxt:       { color: C.soft, fontSize: 13, fontWeight: '600' },
  filterChipTxtActive: { color: C.tealTx, fontWeight: '700' },

  filterChipSm: {
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
  },
  filterChipSmActive:    { backgroundColor: C.pinkBg, borderColor: C.brandB },
  filterChipSmTxt:       { color: C.soft, fontSize: 11.5, fontWeight: '500' },
  filterChipSmTxtActive: { color: C.pinkTx, fontWeight: '700' },

  resultRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 6 },
  resultTxt:   { color: C.mute, fontSize: 12 },
  offlinePill: { backgroundColor: '#FFF7E6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  offlineTxt:  { color: '#D97706', fontSize: 10, fontWeight: '600' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt:  { color: C.mute, fontSize: 14 },

  list: { paddingHorizontal: 16, paddingBottom: 16 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 20, borderWidth: 1, borderColor: C.line,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#1F2937', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  photoWrap:    { width: 90, height: 90, position: 'relative', overflow: 'hidden' },
  photoImg:     { width: 90, height: 90 },
  photoSwatch:  { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  photoIcon:    { fontSize: 28 },
  furnishedBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,207,200,0.92)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  furnishedTxt: { color: '#fff', fontSize: 8, fontWeight: '700' },

  cardInfo:     { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  cardAddress:  { color: C.ink, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  cardDistrict: { color: C.mute, fontSize: 11, marginTop: 2, marginBottom: 6 },
  cardMeta:     { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 6 },
  metaChip:     { backgroundColor: C.bgSoft, borderRadius: 6, borderWidth: 1, borderColor: C.line, paddingHorizontal: 6, paddingVertical: 2 },
  metaChipTxt:  { color: C.soft, fontSize: 10.5, fontWeight: '500' },
  cardPrice:    { color: C.brandA, fontSize: 16, fontWeight: '800' },
  cardPriceSub: { color: C.mute, fontSize: 11, fontWeight: '400' },
  chevron:      { color: C.mute, fontSize: 22, paddingRight: 12 },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: C.ink, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySub:   { color: C.soft, fontSize: 14 },
});
