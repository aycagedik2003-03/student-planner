import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listingService, type LandlordListing } from '../api/ListingService';
import { useT } from '../i18n/translations';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function MyListingsScreen({ navigation }: Props) {
  const { t } = useT();
  const [listings,   setListings]   = useState<LandlordListing[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listingService.getMyLandlordListings();
      console.log('[MyListings] Loaded:', data.length);
      setListings(data);
    } catch (err) {
      console.error('[MyListings] Error:', err);
      Alert.alert(t('common.error'), t('common.tryAgain'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => { loadListings(); }, [loadListings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      t('deleteListing'),
      title,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await listingService.removeListing(id);
              setListings(prev => prev.filter(l => l.id !== id));
              Alert.alert(t('common.success'), t('listingDeleted'));
            } catch (err) {
              console.error('[MyListings] Delete error:', err);
              Alert.alert(t('common.error'), t('deleteFailed'));
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#7C5CFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (listings.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('myListings')}</Text>
        </View>
        <View style={s.center}>
          <Ionicons name="home-outline" size={56} color="#ccc" />
          <Text style={s.emptyText}>{t('noListings')}</Text>
          <TouchableOpacity style={s.createBtn} onPress={() => navigation.navigate('CreateListing')}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={s.createBtnText}>{t('createFirst')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('myListings')}</Text>
        <Text style={s.headerSub}>{listings.length} {t('active')}</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={listings}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            {/* THUMBNAIL */}
            <TouchableOpacity
              style={s.thumbWrap}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            >
              {item.photos.length > 0 ? (
                <Image source={{ uri: item.photos[0] }} style={s.thumb} />
              ) : (
                <View style={[s.thumb, s.thumbFallback]}>
                  <Ionicons name="home" size={36} color="#ddd" />
                </View>
              )}
              <View style={s.photoBadge}>
                <Ionicons name="image-outline" size={13} color="#fff" />
                <Text style={s.photoBadgeText}>{item.photos.length}</Text>
              </View>
            </TouchableOpacity>

            {/* INFO */}
            <View style={s.info}>
              <TouchableOpacity onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.metaRow}>
                  <Text style={s.meta}>📍 {item.city}</Text>
                  <Text style={s.meta}>•</Text>
                  <Text style={s.meta}>
                    {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={s.priceRow}>
                <Text style={s.price}>
                  {item.price_min === item.price_max
                    ? `${item.price_min} PLN`
                    : `${item.price_min}–${item.price_max} PLN`}
                </Text>
                <Text style={s.priceUnit}>/mo</Text>
              </View>

              <View style={s.actions}>
                <TouchableOpacity
                  style={s.btnView}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
                >
                  <Ionicons name="eye-outline" size={15} color="#7C5CFF" />
                  <Text style={s.btnViewText}>{t('view')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.btnDelete}
                  onPress={() => handleDelete(item.id, item.title)}
                >
                  <Ionicons name="trash-outline" size={15} color="#FF6B6B" />
                  <Text style={s.btnDeleteText}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f9f9f9' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  headerSub:   { fontSize: 13, color: '#999', fontWeight: '500' },

  listContent: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 96 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  thumbWrap:    { position: 'relative' },
  thumb:        { width: 100, height: 100, borderRadius: 10, backgroundColor: '#f0f0f0' },
  thumbFallback:{ alignItems: 'center', justifyContent: 'center' },
  photoBadge: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  photoBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  info:    { flex: 1, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  meta:    { fontSize: 12, color: '#666' },

  priceRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: 8 },
  price:     { fontSize: 16, fontWeight: '700', color: '#7C5CFF' },
  priceUnit: { fontSize: 11, color: '#999' },

  actions: { flexDirection: 'row', gap: 8 },
  btnView: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderWidth: 1, borderColor: '#7C5CFF',
    borderRadius: 8, paddingVertical: 7,
  },
  btnDelete: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderWidth: 1, borderColor: '#FF6B6B',
    borderRadius: 8, paddingVertical: 7,
  },
  btnViewText:   { fontSize: 12, fontWeight: '600', color: '#7C5CFF' },
  btnDeleteText: { fontSize: 12, fontWeight: '600', color: '#FF6B6B' },

  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginVertical: 16 },
  createBtn: {
    backgroundColor: '#7C5CFF',
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 24,
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#7C5CFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFF', shadowOpacity: 0.4,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
