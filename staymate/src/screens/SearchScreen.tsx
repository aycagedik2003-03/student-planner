import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { matchService } from '../api/MatchService';
import { listingService } from '../api/ListingService';
import { useT } from '../i18n/translations';
import { useAppStore } from '../store';
import { RootStackParamList } from '../../App';

type TabType    = 'roommates' | 'listings';
type FilterType = 'all' | '75' | '85';

interface Roommate {
  id: string;
  match_id?: string;
  name: string | null;
  age: number | null;
  city: string | null;
  avatar_url: string | null;
  bio: string | null;
  match_score: number | null;
}

interface ListingItem {
  id: string;
  title: string;
  city: string;
  price_min: number;
  price_max: number;
  photos: string[];
}

export default function SearchScreen() {
  const { t } = useT();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab,    setActiveTab]    = useState<TabType>('roommates');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [roommates,    setRoommates]    = useState<Roommate[]>([]);
  const [listings,     setListings]     = useState<ListingItem[]>([]);
  const [loading,      setLoading]      = useState(false);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    const token = useAppStore.getState().token ?? localStorage.getItem('userToken');
    if (!token) {
      console.log('[SearchScreen] No token, skipping load');
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    try {
      if (activeTab === 'roommates') {
        const data = await matchService.getSuggestions();
        const flat: Roommate[] = data.map((item: any) => {
          const p = item.profile || item;
          return {
            id:          p.id     ?? String(Math.random()),
            match_id:    item.match_id,
            name:        p.name   || null,
            age:         p.age    || null,
            city:        p.city   || null,
            avatar_url:  p.avatar_url || null,
            bio:         p.bio    || null,
            match_score: item.compatibility_score ?? item.match_score ?? null,
          };
        });
        setRoommates(flat);
      } else {
        const data = await listingService.getListings();
        const flat: ListingItem[] = data.map((l: any) => ({
          id:        l.id       ?? '',
          title:     l.address  ?? l.title ?? '',
          city:      l.city     ?? '',
          price_min: l.price    ?? 0,
          price_max: l.price    ?? 0,
          photos:    Array.isArray(l.photos) ? l.photos : [],
        }));
        setListings(flat);
      }
    } catch (err: any) {
      console.error('[SearchScreen] Load error:', err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  // t intentionally omitted — causes new ref on every render → loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const isMountedRef = useRef(false);

  // Initial load when screen gains focus
  useFocusEffect(useCallback(() => {
    isMountedRef.current = false; // reset so tab-change effect knows focus just happened
    loadData();
    return () => { loadingRef.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  // Reload when tab switches (skip the very first render, useFocusEffect handles that)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return; }
    loadingRef.current = false; // reset guard so new tab can load
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredRoommates = roommates
    .filter(r => (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => {
      if (activeFilter === '75') return (r.match_score ?? 0) >= 75;
      if (activeFilter === '85') return (r.match_score ?? 0) >= 85;
      return true;
    });

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredData = activeTab === 'roommates' ? filteredRoommates : filteredListings;

  const handleRoommateTap = (roommate: Roommate) => {
    (navigation as any).navigate('Chat', { screen: 'ChatList' });
    setTimeout(() => {
      (navigation as any).navigate('Chat', {
        screen: 'ChatDetail',
        params: {
          chatId:     roommate.match_id ?? roommate.id,
          name:       roommate.name ?? '',
          avatar_url: roommate.avatar_url,
        },
      });
    }, 50);
  };

  const handleListingTap = (listing: ListingItem) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('nav_search')}</Text>
      </View>

      {/* TABS */}
      <View style={s.tabs}>
        {(['listings', 'roommates'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'listings' ? t('listings') : t('roommates')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH BAR */}
      <View style={s.searchRow}>
        <Ionicons name="search" size={18} color="#aaa" style={{ marginLeft: 12 }} />
        <TextInput
          style={s.searchInput}
          placeholder={activeTab === 'roommates' ? t('searchByName') : t('searchByTitle')}
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* QUICK FILTERS (roommates only) */}
      {activeTab === 'roommates' && (
        <View style={s.pills}>
          {(['all', '75', '85'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[s.pill, activeFilter === f && s.pillActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[s.pillText, activeFilter === f && s.pillTextActive]}>
                {f === 'all' ? t('all') : `${f}%+`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CONTENT */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#7C5CFF" />
        </View>
      ) : filteredData.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="search-outline" size={56} color="#ddd" />
          <Text style={s.emptyText}>{t('noResults') || 'Sonuç yok'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData as any[]}
          keyExtractor={item => item.id ?? item.match_id}
          contentContainerStyle={s.list}
          renderItem={({ item }) =>
            activeTab === 'roommates'
              ? <RoommateCard roommate={item as Roommate} onPress={() => handleRoommateTap(item as Roommate)} />
              : <ListingCard  listing={item as ListingItem} onPress={() => handleListingTap(item as ListingItem)} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Roommate Card ────────────────────────────────────────────────────────────

function RoommateCard({ roommate, onPress }: { roommate: Roommate; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      {roommate.avatar_url ? (
        <Image source={{ uri: roommate.avatar_url }} style={s.cardAvatar} />
      ) : (
        <View style={[s.cardAvatar, s.cardAvatarFallback]}>
          <Ionicons name="person" size={26} color="#ccc" />
        </View>
      )}
      <View style={s.cardBody}>
        <Text style={s.cardTitle}>
          {roommate.name ?? '—'}{roommate.age ? `, ${roommate.age}` : ''}
        </Text>
        {roommate.city ? (
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={13} color="#aaa" />
            <Text style={s.metaText}>{roommate.city}</Text>
          </View>
        ) : null}
        {roommate.bio ? <Text style={s.bioText} numberOfLines={1}>{roommate.bio}</Text> : null}
      </View>
      {roommate.match_score != null && (
        <View style={s.scoreBadge}>
          <Text style={s.scoreText}>{Math.round(roommate.match_score)}%</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#ddd" />
    </TouchableOpacity>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, onPress }: { listing: ListingItem; onPress: () => void }) {
  const photoUri = listing.photos.find(p => p.startsWith('http'));
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={s.cardAvatar} />
      ) : (
        <View style={[s.cardAvatar, s.cardAvatarFallback]}>
          <Ionicons name="home-outline" size={26} color="#ccc" />
        </View>
      )}
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{listing.title}</Text>
        {listing.city ? (
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={13} color="#aaa" />
            <Text style={s.metaText}>{listing.city}</Text>
          </View>
        ) : null}
        <Text style={s.priceText}>
          {listing.price_min === listing.price_max
            ? `${listing.price_min} PLN`
            : `${listing.price_min}–${listing.price_max} PLN`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ddd" />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1a1a2e' },

  tabs: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: '#7C5CFF' },
  tabText:       { fontSize: 14, fontWeight: '600', color: '#aaa' },
  tabTextActive: { color: '#7C5CFF' },

  searchRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
    fontSize: 14,
    color: '#333',
  },

  pills: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pill: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillActive:     { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' },
  pillText:       { fontSize: 12, fontWeight: '600', color: '#666' },
  pillTextActive: { color: '#fff' },

  list: { paddingHorizontal: 8, paddingVertical: 8 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardAvatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f0f0f0' },
  cardAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
  cardBody:           { flex: 1 },
  cardTitle:          { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  metaRow:            { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  metaText:           { fontSize: 12, color: '#888' },
  bioText:            { fontSize: 12, color: '#aaa' },
  priceText:          { fontSize: 13, fontWeight: '700', color: '#7C5CFF' },

  scoreBadge: {
    backgroundColor: '#7C5CFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
  },
  scoreText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  emptyText: { fontSize: 15, color: '#aaa', marginTop: 12 },
});
