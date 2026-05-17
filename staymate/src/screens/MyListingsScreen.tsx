import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { landlordService } from '../api/LandlordService';
import type { Listing } from '../data/listings';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brand: '#00CFC8', brandBg: '#E6FBFA',
  danger: '#EF4444', dangerBg: '#FEF2F2',
};

type ListingWithPublished = Listing & { published?: boolean };

export default function MyListingsScreen({ navigation }: Props) {
  const [listings,   setListings]   = useState<ListingWithPublished[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await landlordService.getMyListings();
      setListings(data as ListingWithPublished[]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İlanlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const handleTogglePublish = async (item: ListingWithPublished) => {
    const next = !item.published;
    try {
      await landlordService.togglePublish(item.id, next);
      setListings(prev =>
        prev.map(l => l.id === item.id ? { ...l, published: next } : l),
      );
    } catch {
      Alert.alert('Hata', 'Yayın durumu değiştirilemedi.');
    }
  };

  const handleDelete = (item: ListingWithPublished) => {
    Alert.alert(
      'İlanı Sil',
      `"${item.address}" ilanını silmek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            try {
              await landlordService.deleteListing(item.id);
              setListings(prev => prev.filter(l => l.id !== item.id));
            } catch {
              Alert.alert('Hata', 'İlan silinemedi.');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: ListingWithPublished }) => (
    <Pressable
      style={st.card}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
    >
      {/* Color strip */}
      <View style={[st.colorStrip, { backgroundColor: item.photos[0] ?? C.brandBg }]} />

      <View style={st.cardBody}>
        <View style={st.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={st.cardTitle} numberOfLines={1}>{item.address}</Text>
            <Text style={st.cardSub}>{item.city}{item.district ? ` · ${item.district}` : ''}</Text>
          </View>
          <View style={[
            st.badge,
            item.published ? st.badgeActive : st.badgeDraft,
          ]}>
            <Text style={[
              st.badgeTxt,
              item.published ? st.badgeActiveTxt : st.badgeDraftTxt,
            ]}>
              {item.published ? '● Yayında' : '○ Taslak'}
            </Text>
          </View>
        </View>

        <View style={st.metaRow}>
          <Text style={st.meta}>{item.rooms} oda</Text>
          <Text style={st.metaDot}>·</Text>
          <Text style={st.meta}>{item.price} PLN/ay</Text>
          {item.wifi    && <><Text style={st.metaDot}>·</Text><Text style={st.meta}>WiFi</Text></>}
          {item.furnished && <><Text style={st.metaDot}>·</Text><Text style={st.meta}>Eşyalı</Text></>}
        </View>

        <View style={st.actions}>
          <Pressable
            style={[st.btn, item.published ? st.btnDanger : st.btnBrand]}
            onPress={() => handleTogglePublish(item)}
          >
            <Text style={[st.btnTxt, item.published ? st.btnDangerTxt : st.btnBrandTxt]}>
              {item.published ? 'Yayından Kaldır' : 'Yayınla'}
            </Text>
          </Pressable>

          <Pressable
            style={[st.btn, st.btnGhost]}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Text style={st.btnGhostTxt}>Düzenle</Text>
          </Pressable>

          <Pressable
            style={[st.btn, st.btnDelete]}
            onPress={() => handleDelete(item)}
          >
            <Text style={st.btnDeleteTxt}>🗑</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>İlanlarım</Text>
        <Pressable
          style={st.addBtn}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Text style={st.addBtnTxt}>+ Yeni İlan</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={st.center}>
          <ActivityIndicator color={C.brand} size="large" />
        </View>
      ) : error ? (
        <View style={st.center}>
          <Text style={st.errorIcon}>⚠</Text>
          <Text style={st.errorTxt}>{error}</Text>
          <Pressable style={st.retryBtn} onPress={() => load()}>
            <Text style={st.retryTxt}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : listings.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>🏠</Text>
          <Text style={st.emptyTitle}>Henüz ilan yok</Text>
          <Text style={st.emptySub}>İlk ilanını oluşturmaya başla.</Text>
          <Pressable style={st.addBtn} onPress={() => navigation.navigate('CreateListing')}>
            <Text style={st.addBtnTxt}>+ İlan Oluştur</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12 }}
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
  addBtn: { backgroundColor: C.brand, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTxt:  { color: C.soft, fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:  { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  retryTxt:  { color: C.brand, fontWeight: '700', fontSize: 14 },
  emptyIcon:  { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: C.soft, textAlign: 'center', marginBottom: 24 },
  card:     { backgroundColor: C.bg, borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden', shadowColor: '#1F2937', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  colorStrip: { height: 6, width: '100%' },
  cardBody:   { padding: 16 },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  cardTitle:  { fontSize: 16, fontWeight: '700', color: C.ink },
  cardSub:    { fontSize: 13, color: C.mute, marginTop: 2 },
  badge:      { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  badgeActive:    { backgroundColor: '#DCFCE7' },
  badgeDraft:     { backgroundColor: '#F3F4F6' },
  badgeTxt:       { fontSize: 12, fontWeight: '600' },
  badgeActiveTxt: { color: '#16A34A' },
  badgeDraftTxt:  { color: C.mute },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  meta:    { fontSize: 13, color: C.soft },
  metaDot: { fontSize: 13, color: C.mute },
  actions: { flexDirection: 'row', gap: 8 },
  btn:        { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  btnBrand:   { backgroundColor: C.brand },
  btnBrandTxt:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  btnDanger:  { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '44' },
  btnDangerTxt:{ color: C.danger, fontSize: 13, fontWeight: '700' },
  btnGhost:   { backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line },
  btnGhostTxt:{ color: C.soft, fontSize: 13, fontWeight: '600' },
  btnDelete:  { backgroundColor: C.dangerBg, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  btnDeleteTxt:{ fontSize: 14 },
  btnTxt:   { fontSize: 13, fontWeight: '700' },
});
