import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../../App';
import { listingService } from '../api/ListingService';
import type { Listing } from '../data/listings';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'BrowseListings'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brand: '#00CFC8', brandBg: '#E6FBFA', brandTx: '#00A8A2',
  pink: '#FF9ACD', pinkBg: '#FFF0F7',
};

const CITIES = ['Tümü', 'Kraków', 'Warszawa', 'Wrocław', 'Gdańsk', 'Poznań'];

export default function BrowseListingsScreen({ navigation }: Props) {
  const [listings,   setListings]   = useState<Listing[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [favorites,  setFavorites]  = useState<Set<string>>(new Set());

  // Filtreler
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [maxPrice,     setMaxPrice]     = useState('');
  const [minRooms,     setMinRooms]     = useState('');

  const buildFilters = useCallback(() => ({
    ...(selectedCity !== 'Tümü' ? { city: selectedCity } : {}),
    ...(maxPrice ? { priceMax: Number(maxPrice) } : {}),
    ...(minRooms ? { rooms:    Number(minRooms) } : {}),
  }), [selectedCity, maxPrice, minRooms]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await listingService.getListings(buildFilters());
      setListings(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İlanlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildFilters]);

  useEffect(() => { load(); }, [selectedCity]);  // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const handleFavorite = async (listing: Listing) => {
    try {
      const res = await listingService.addFavorite(listing.id);
      setFavorites(prev => {
        const next = new Set(prev);
        res.favorited ? next.add(listing.id) : next.delete(listing.id);
        return next;
      });
    } catch {
      Alert.alert('Hata', 'Favori güncellenemedi.');
    }
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const isFav = favorites.has(item.id);
    const photo = item.photos[0];
    const isColor = photo && photo.startsWith('#');

    return (
      <Pressable
        style={st.card}
        onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
        activeOpacity={0.85}
      >
        {/* Fotoğraf / renk banner */}
        <View style={[st.photo, { backgroundColor: isColor ? photo : C.brandBg }]}>
          {!isColor && photo && (
            <Text style={st.photoPlaceholder}>🏠</Text>
          )}
          {isColor && <Text style={st.photoPlaceholder}>🏠</Text>}

          {/* Favori butonu */}
          <Pressable
            style={st.favBtn}
            onPress={() => handleFavorite(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{isFav ? '♥' : '♡'}</Text>
          </Pressable>

          {/* Fiyat badge */}
          <View style={st.priceBadge}>
            <Text style={st.priceTxt}>{item.price} PLN/ay</Text>
          </View>
        </View>

        <View style={st.cardBody}>
          <Text style={st.cardTitle} numberOfLines={1}>{item.address}</Text>
          <Text style={st.cardSub}>
            📍 {item.city}{item.district ? ` · ${item.district}` : ''}
          </Text>

          <View style={st.tagRow}>
            <View style={st.tag}><Text style={st.tagTxt}>{item.rooms} oda</Text></View>
            {item.furnished && <View style={st.tag}><Text style={st.tagTxt}>Eşyalı</Text></View>}
            {item.wifi      && <View style={st.tag}><Text style={st.tagTxt}>WiFi</Text></View>}
            {item.petsAllowed && <View style={st.tag}><Text style={st.tagTxt}>Evcil hayvanlı</Text></View>}
          </View>

          {/* Ev sahibine mesaj */}
          <Pressable
            style={st.msgBtn}
            onPress={() => {
              if (item.owner?.matchId) {
                navigation.navigate('Chat', { matchId: item.owner.matchId });
              } else {
                navigation.navigate('ListingDetail', { listingId: item.id });
              }
            }}
          >
            <Text style={st.msgBtnTxt}>💬 Ev Sahibine Mesaj</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>İlanlar</Text>
        <Text style={st.count}>
          {!loading && `${listings.length} ilan`}
        </Text>
      </View>

      {/* Şehir filtresi */}
      <FlatList
        data={CITIES}
        keyExtractor={(c) => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.cityStrip}
        renderItem={({ item }) => (
          <Pressable
            style={[st.cityChip, selectedCity === item && st.cityChipActive]}
            onPress={() => setSelectedCity(item)}
          >
            <Text style={[st.cityTxt, selectedCity === item && st.cityTxtActive]}>{item}</Text>
          </Pressable>
        )}
      />

      {/* Fiyat + oda filtresi */}
      <View style={st.filterRow}>
        <TextInput
          style={st.filterInput}
          placeholder="Max fiyat (PLN)"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={() => load()}
          placeholderTextColor={C.mute}
        />
        <TextInput
          style={st.filterInput}
          placeholder="Min oda"
          value={minRooms}
          onChangeText={setMinRooms}
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={() => load()}
          placeholderTextColor={C.mute}
        />
        <Pressable style={st.searchBtn} onPress={() => load()}>
          <Text style={st.searchBtnTxt}>Ara</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={st.center}>
          <ActivityIndicator color={C.brand} size="large" />
        </View>
      ) : error ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>⚠</Text>
          <Text style={st.errorTxt}>{error}</Text>
          <Pressable style={st.retryBtn} onPress={() => load()}>
            <Text style={st.retryTxt}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : listings.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>🏠</Text>
          <Text style={st.emptyTitle}>İlan bulunamadı</Text>
          <Text style={st.emptySub}>Filtreleri genişletmeyi dene.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  title:  { fontSize: 22, fontWeight: '800', color: C.ink },
  count:  { fontSize: 14, color: C.mute },
  cityStrip: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  cityChip:  { borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: C.line },
  cityChipActive: { backgroundColor: C.brandBg, borderColor: C.brand },
  cityTxt:        { fontSize: 13, fontWeight: '600', color: C.mute },
  cityTxtActive:  { color: C.brand },
  filterRow:  { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterInput:{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, fontSize: 13, color: C.ink, backgroundColor: C.bgSoft },
  searchBtn:  { backgroundColor: C.brand, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt:{ color: '#fff', fontWeight: '700', fontSize: 13 },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:  { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: C.soft, textAlign: 'center' },
  errorTxt:   { color: C.soft, fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:   { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  retryTxt:   { color: C.brand, fontWeight: '700', fontSize: 14 },
  card:      { backgroundColor: C.bg, borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden', shadowColor: '#1F2937', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  photo:     { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  photoPlaceholder: { fontSize: 48 },
  favBtn:    { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  priceBadge:{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  priceTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardBody:  { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: C.mute, marginBottom: 10 },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag:       { backgroundColor: C.brandBg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 9 },
  tagTxt:    { fontSize: 12, color: C.brandTx, fontWeight: '600' },
  msgBtn:    { backgroundColor: C.brandBg, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.brand + '55' },
  msgBtnTxt: { color: C.brand, fontSize: 13, fontWeight: '700' },
});
