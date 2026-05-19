import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  FlatList, ScrollView, ActivityIndicator, Image, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../../App';
import { LISTINGS, type Listing } from '../data/listings';
import { listingService } from '../api/ListingService';
import { useTranslation } from '../i18n/useTranslation';

const { width: SCREEN_W } = Dimensions.get('window');
const NUM_COLS = SCREEN_W >= 480 ? 2 : 2; // her zaman 2, tablet'te de 2
const CARD_W   = (SCREEN_W - 16 * 2 - 12) / 2;

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

const CITY_NAMES = ['Kraków', 'Warszawa', 'Poznań', 'Wrocław', 'Gdańsk', 'Łódź'];
const PRICE_RANGES = [
  { min: 0,    max: Infinity },
  { min: 0,    max: 1500     },
  { min: 1500, max: 2500     },
  { min: 2500, max: Infinity },
];

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/'); }

// ── Listing card — 2-kolon grid ──────────────────────────────────────────────
const ListingCard = React.memo(function ListingCard({
  item, onPress, furnishedLabel, roomsLabel,
}: { item: Listing; onPress: () => void; furnishedLabel: string; roomsLabel: (n: number) => string }) {
  const photo = item.photos[0];
  return (
    <TouchableOpacity style={[st.card, { width: CARD_W }]} onPress={onPress} activeOpacity={0.8}>
      {/* Fotoğraf alanı */}
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
            <Text style={st.furnishedTxt}>{furnishedLabel}</Text>
          </View>
        )}
        <View style={st.priceBadge}>
          <Text style={st.priceBadgeTxt}>{item.price.toLocaleString('tr-TR')} PLN</Text>
        </View>
      </View>

      {/* Bilgi alanı */}
      <View style={st.cardInfo}>
        <Text style={st.cardAddress} numberOfLines={2}>{item.address}</Text>
        <Text style={st.cardDistrict} numberOfLines={1}>
          📍 {[item.district, item.city].filter(Boolean).join(', ') || '—'}
        </Text>
        <View style={st.cardMeta}>
          <View style={st.metaChip}><Text style={st.metaChipTxt}>{roomsLabel(item.rooms)}</Text></View>
          {item.wifi && <View style={st.metaChip}><Text style={st.metaChipTxt}>WiFi</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ListingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [allListings, setAllListings] = useState<Listing[]>(LISTINGS);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [usingLocal,  setUsingLocal]  = useState(false);

  const [search,   setSearch]   = useState('');
  const [city,     setCity]     = useState('');
  const [priceIdx, setPriceIdx] = useState(0);

  const ALL_LABEL = t('listing.all');
  const CITIES = [ALL_LABEL, ...CITY_NAMES];
  const PRICE_FILTERS = [
    { label: t('listing.all'),    ...PRICE_RANGES[0] },
    { label: '< 1500 PLN',        ...PRICE_RANGES[1] },
    { label: '1500–2500 PLN',     ...PRICE_RANGES[2] },
    { label: '> 2500 PLN',        ...PRICE_RANGES[3] },
  ];

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
      (!city || city === ALL_LABEL || l.city === city) &&
      l.price >= p.min && l.price <= p.max &&
      (!q || l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q))
    );
  }, [allListings, city, priceIdx, search]);

  const handleCardPress = useCallback((id: string) => {
    navigation.navigate('ListingDetail', { listingId: id });
  }, [navigation]);

  const furnishedLabel = t('listing.furnished');
  const roomsLabel = (n: number) => t('listing.rooms').replace('{0}', String(n));

  const renderItem = useCallback(({ item }: { item: Listing }) => (
    <ListingCard
      item={item}
      onPress={() => handleCardPress(item.id)}
      furnishedLabel={furnishedLabel}
      roomsLabel={roomsLabel}
    />
  ), [handleCardPress, furnishedLabel]);

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={st.header}>
        <Text style={st.hTitle}>{t('listing.title')}</Text>
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
          placeholder={t('listing.search')}
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
        <Text style={st.resultTxt}>{t('listing.found').replace('{0}', String(filtered.length))}</Text>
        {usingLocal && (
          <View style={st.offlinePill}>
            <Text style={st.offlineTxt}>{t('listing.offline')}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLS}
          columnWrapperStyle={st.columnWrapper}
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
              <Text style={st.emptyTitle}>{t('listing.noResults')}</Text>
              <Text style={st.emptySub}>{t('listing.noResultsSub')}</Text>
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

  list:          { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  columnWrapper: { gap: 12, marginBottom: 12 },

  card: {
    backgroundColor: C.bg, borderRadius: 16, borderWidth: 1, borderColor: C.line,
    overflow: 'hidden',
    shadowColor: '#1F2937', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  photoWrap:   { width: '100%', height: 130, position: 'relative', overflow: 'hidden' },
  photoImg:    { width: '100%', height: 130 },
  photoSwatch: { width: '100%', height: 130, alignItems: 'center', justifyContent: 'center' },
  photoIcon:   { fontSize: 36 },
  furnishedBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#00BCD4', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  furnishedTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
  priceBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 5, paddingHorizontal: 10,
  },
  priceBadgeTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  cardInfo:     { padding: 10 },
  cardAddress:  { color: C.ink, fontSize: 13, fontWeight: '700', marginBottom: 3, lineHeight: 18 },
  cardDistrict: { color: C.mute, fontSize: 11, marginBottom: 6 },
  cardMeta:     { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  metaChip:     { backgroundColor: '#E1F5EE', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  metaChipTxt:  { color: '#00BCD4', fontSize: 10, fontWeight: '600' },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: C.ink, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySub:   { color: C.soft, fontSize: 14 },
});
