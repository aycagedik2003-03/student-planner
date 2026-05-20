// src/screens/SearchScreen.tsx — Search Listings & Roommates
//
// Dual-tab search interface
// Tab 1: Search listings (houses/rooms)
// Tab 2: Search roommates (people with filters)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENT, SHADOW, SPACING, RADII } from '../utils/constants';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { useT } from '../i18n/translations';

type TabType = 'listings' | 'roommates';

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  bedrooms: number;
  image: string;
}

interface Roommate {
  id: string;
  name: string;
  age: number;
  city: string;
  matchScore: number;
  avatar: string;
}

// Mock data
const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: '2BR Apartment near UAM',
    price: 1200,
    city: 'Poznań',
    bedrooms: 2,
    image: '🏠',
  },
  {
    id: '2',
    title: 'Studio in city center',
    price: 900,
    city: 'Poznań',
    bedrooms: 1,
    image: '🏘️',
  },
  {
    id: '3',
    title: '3BR House - 2 rooms available',
    price: 1500,
    city: 'Poznań',
    bedrooms: 3,
    image: '🏠',
  },
];

const MOCK_ROOMMATES: Roommate[] = [
  {
    id: '1',
    name: 'Marta',
    age: 22,
    city: 'Poznań',
    matchScore: 92,
    avatar: 'M',
  },
  {
    id: '2',
    name: 'Alex',
    age: 23,
    city: 'Poznań',
    matchScore: 87,
    avatar: 'A',
  },
  {
    id: '3',
    name: 'Jana',
    age: 21,
    city: 'Poznań',
    matchScore: 78,
    avatar: 'J',
  },
];

// ─── Listings Tab ─────────────────────────────────────────────────────────────
function ListingsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  const filteredListings = MOCK_LISTINGS.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Filters */}
      <View style={s.filtersSection}>
        <TextInput
          placeholder="Search listings..."
          placeholderTextColor={COLORS.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={s.searchInput}
        />
        <Pressable style={s.filterIconBtn}>
          <Feather name="sliders" size={20} color={COLORS.secondary} />
        </Pressable>
      </View>

      {/* Price range filter */}
      <View style={s.quickFilters}>
        {['< 1000', '1000-1500', '> 1500'].map((range) => (
          <Pressable
            key={range}
            onPress={() => setPriceFilter(range)}
            style={[
              s.quickFilterBtn,
              priceFilter === range && s.quickFilterBtnActive,
            ]}>
            <Text
              style={[
                s.quickFilterText,
                priceFilter === range && s.quickFilterTextActive,
              ]}>
              {range}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      <View style={s.section}>
        {filteredListings.map((listing) => (
          <Pressable key={listing.id} style={s.listingCard}>
            <View style={s.listingHeader}>
              <Text style={s.listingImage}>{listing.image}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.listingTitle}>{listing.title}</Text>
                <Text style={s.listingMeta}>
                  {listing.bedrooms} BR • {listing.city}
                </Text>
              </View>
            </View>
            <View style={s.listingFooter}>
              <Text style={s.listingPrice}>PLN {listing.price}/mo</Text>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.secondary}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Roommates Tab ────────────────────────────────────────────────────────────
function RoommatesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchFilter, setMatchFilter] = useState(0);

  const filteredRoommates = MOCK_ROOMMATES.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      r.matchScore >= matchFilter
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={s.filtersSection}>
        <TextInput
          placeholder="Search by name..."
          placeholderTextColor={COLORS.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={s.searchInput}
        />
        <Pressable style={s.filterIconBtn}>
          <Feather name="sliders" size={20} color={COLORS.secondary} />
        </Pressable>
      </View>

      {/* Match score filter */}
      <View style={s.quickFilters}>
        {[
          { label: 'All', value: 0 },
          { label: '75%+', value: 75 },
          { label: '85%+', value: 85 },
        ].map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setMatchFilter(item.value)}
            style={[
              s.quickFilterBtn,
              matchFilter === item.value && s.quickFilterBtnActive,
            ]}>
            <Text
              style={[
                s.quickFilterText,
                matchFilter === item.value && s.quickFilterTextActive,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      <View style={s.section}>
        {filteredRoommates.map((roommate) => (
          <Pressable key={roommate.id} style={s.roommateCard}>
            <Avatar size={64} hue={0} label={roommate.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={s.roommateNameRow}>
                <Text style={s.roommateName}>
                  {roommate.name}, {roommate.age}
                </Text>
                <LinearGradient
                  colors={GRADIENT.brand as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.matchBadge}>
                  <Text style={s.matchText}>
                    {roommate.matchScore}%
                  </Text>
                </LinearGradient>
              </View>
              <Text style={s.roommateCity}>
                📍 {roommate.city}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.secondary}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<TabType>('listings');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Search</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {(['listings', 'roommates'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, isActive && s.tabActive]}>
              {isActive && (
                <LinearGradient
                  colors={GRADIENT.brand as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text
                style={[
                  s.tabText,
                  isActive && s.tabTextActive,
                ]}>
                {tab === 'listings' ? 'Listings' : 'Roommates'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <View style={s.content}>
        {activeTab === 'listings' ? (
          <ListingsTab />
        ) : (
          <RoommatesTab />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: 8,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  tabActive: {
    borderColor: 'transparent',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.soft,
  },
  tabTextActive: {
    color: '#fff',
  },

  filtersSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickFilterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  quickFilterBtnActive: {
    borderColor: 'transparent',
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.soft,
  },
  quickFilterTextActive: {
    color: '#fff',
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  listingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  listingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listingImage: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  listingMeta: {
    fontSize: 12,
    color: COLORS.soft,
    marginTop: 4,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },

  roommateCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roommateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roommateName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
  },
  matchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  roommateCity: {
    fontSize: 12,
    color: COLORS.soft,
  },
});
