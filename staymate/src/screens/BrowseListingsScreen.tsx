// src/screens/BrowseListingsScreen.tsx — Browse rentals
//
// Clean, minimal design:
// - Header: title + city chip (selected from profile)
// - Filter button (opens modal: price range, rooms, type)
// - Sort button (newest / price asc / price desc)
// - Listings list with photo + price + district

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { COLORS, SHADOW, RADII, SPACING } from '../utils/constants';
import { useT } from '../i18n/translations';

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  district?: string;
  rooms: number;
  sizeM2?: number;
  type: 'apartment' | 'room' | 'studio';
  furnished: boolean;
  petsAllowed: boolean;
  utilitiesIncluded: boolean;
  imageUrl?: string;
  createdAt: string;
}

type SortMode = 'newest' | 'price_asc' | 'price_desc';

interface Filters {
  minPrice: number;
  maxPrice: number;
  rooms: number | null;
  type: Listing['type'] | null;
  furnished: boolean | null;
  petsAllowed: boolean | null;
  utilitiesIncluded: boolean | null;
}

const DEFAULT_FILTERS: Filters = {
  minPrice: 0,
  maxPrice: 5000,
  rooms: null,
  type: null,
  furnished: null,
  petsAllowed: null,
  utilitiesIncluded: null,
};

const MOCK_LISTINGS: Listing[] = [
  { id: '1', title: 'Modern studio near Stary Rynek', price: 1800, city: 'Poznań', district: 'Stare Miasto', rooms: 1, sizeM2: 32, type: 'studio', furnished: true, petsAllowed: false, utilitiesIncluded: true,  createdAt: '2026-05-18' },
  { id: '2', title: 'Room in shared 3BR apartment',  price: 1200, city: 'Poznań', district: 'Jeżyce',      rooms: 1, sizeM2: 18, type: 'room',    furnished: true, petsAllowed: true,  utilitiesIncluded: false, createdAt: '2026-05-17' },
  { id: '3', title: 'Cozy 2BR near UAM campus',      price: 2400, city: 'Poznań', district: 'Grunwald',    rooms: 2, sizeM2: 55, type: 'apartment', furnished: false, petsAllowed: true, utilitiesIncluded: false, createdAt: '2026-05-16' },
  { id: '4', title: 'Bright studio with balcony',    price: 1600, city: 'Poznań', district: 'Wilda',       rooms: 1, sizeM2: 28, type: 'studio',    furnished: true, petsAllowed: false, utilitiesIncluded: true, createdAt: '2026-05-15' },
  { id: '5', title: 'Spacious 3BR family apartment', price: 2900, city: 'Poznań', district: 'Nowe Miasto', rooms: 3, sizeM2: 78, type: 'apartment', furnished: false, petsAllowed: true,  utilitiesIncluded: true,  createdAt: '2026-05-14' },
  { id: '6', title: 'Budget room near Polytechnic',  price: 800,  city: 'Poznań', district: 'Wilda',       rooms: 1, sizeM2: 14, type: 'room',      furnished: true, petsAllowed: false, utilitiesIncluded: true,  createdAt: '2026-05-13' },
];

// ═══ ListingCard ═══
function ListingCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
      <View style={s.cardImageWrap}>
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={s.cardImage} />
        ) : (
          <View style={[s.cardImage, s.cardImagePlaceholder]}>
            <Feather name="home" size={28} color={COLORS.muted} />
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{listing.title}</Text>
        <Text style={s.cardDistrict} numberOfLines={1}>
          {listing.district ? listing.district + ', ' : ''}{listing.city}
        </Text>
        <View style={s.cardMeta}>
          <View style={s.cardMetaItem}>
            <Feather name="layers" size={12} color={COLORS.muted} />
            <Text style={s.cardMetaText}>{listing.rooms} {listing.rooms === 1 ? 'room' : 'rooms'}</Text>
          </View>
          {listing.sizeM2 && (
            <View style={s.cardMetaItem}>
              <Feather name="maximize-2" size={12} color={COLORS.muted} />
              <Text style={s.cardMetaText}>{listing.sizeM2} m²</Text>
            </View>
          )}
          <Text style={s.cardPrice}>{listing.price} zł<Text style={s.cardPriceUnit}>/mo</Text></Text>
        </View>
        <View style={s.cardTags}>
          {listing.furnished        && <View style={s.cardTag}><Text style={s.cardTagText}>🪑 Furnished</Text></View>}
          {listing.petsAllowed      && <View style={s.cardTag}><Text style={s.cardTagText}>🐾 Pets OK</Text></View>}
          {listing.utilitiesIncluded && <View style={s.cardTag}><Text style={s.cardTagText}>⚡ Bills incl.</Text></View>}
        </View>
      </View>
    </Pressable>
  );
}

// ═══ Sort Sheet ═══
function SortMenu({ visible, current, onClose, onSelect }: { visible: boolean; current: SortMode; onClose: () => void; onSelect: (m: SortMode) => void }) {
  const opts: { value: SortMode; label: string; icon: any }[] = [
    { value: 'newest', label: 'Newest first', icon: 'clock' },
    { value: 'price_asc', label: 'Price: low to high', icon: 'arrow-up' },
    { value: 'price_desc', label: 'Price: high to low', icon: 'arrow-down' },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.sortSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={s.sheetTitle}>Sort by</Text>
          {opts.map((o) => {
            const on = o.value === current;
            return (
              <Pressable key={o.value} onPress={() => { onSelect(o.value); onClose(); }} style={[s.sortRow, on && s.sortRowOn]}>
                <Feather name={o.icon} size={16} color={on ? COLORS.primary : COLORS.soft} />
                <Text style={[s.sortLabel, on && s.sortLabelOn]}>{o.label}</Text>
                {on && <Feather name="check" size={16} color={COLORS.primary} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══ Filter Modal ═══
function TriToggle({
  label, value, onChange,
  onLabel = 'Yes', offLabel = 'No',
}: {
  label: string; value: boolean | null;
  onChange: (v: boolean | null) => void;
  onLabel?: string; offLabel?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.filterLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([null, true, false] as const).map((opt) => {
          const active = value === opt;
          const lbl = opt === null ? 'Any' : opt ? onLabel : offLabel;
          return (
            <Pressable key={String(opt)} onPress={() => onChange(opt)}
              style={[s.chip, active && s.chipOn]}>
              <Text style={[s.chipText, active && s.chipTextOn]}>{lbl}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FilterModal({ visible, filters, onClose, onApply }: { visible: boolean; filters: Filters; onClose: () => void; onApply: (f: Filters) => void }) {
  const [draft, setDraft] = useState<Filters>(filters);
  React.useEffect(() => { if (visible) setDraft(filters); }, [visible, filters]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.filterSheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Filters</Text>
            <Pressable onPress={() => setDraft(DEFAULT_FILTERS)}>
              <Text style={s.resetText}>Reset all</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Price */}
            <Text style={s.filterLabel}>Price range (zł/mo)</Text>
            <View style={s.priceRow}>
              <View style={s.priceField}>
                <Text style={s.priceFieldLabel}>Min</Text>
                <TextInput value={String(draft.minPrice)} onChangeText={(v) => setDraft({ ...draft, minPrice: parseInt(v) || 0 })} keyboardType="number-pad" style={s.priceInput} />
              </View>
              <View style={s.priceField}>
                <Text style={s.priceFieldLabel}>Max</Text>
                <TextInput value={String(draft.maxPrice)} onChangeText={(v) => setDraft({ ...draft, maxPrice: parseInt(v) || 0 })} keyboardType="number-pad" style={s.priceInput} />
              </View>
            </View>

            {/* Rooms */}
            <Text style={s.filterLabel}>Rooms</Text>
            <View style={s.chipRow}>
              {[null, 1, 2, 3, 4].map((r) => {
                const on = draft.rooms === r;
                return (
                  <Pressable key={String(r)} onPress={() => setDraft({ ...draft, rooms: r })} style={[s.chip, on && s.chipOn]}>
                    <Text style={[s.chipText, on && s.chipTextOn]}>{r === null ? 'Any' : r + '+'}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Type */}
            <Text style={s.filterLabel}>Type</Text>
            <View style={s.chipRow}>
              {[
                { v: null, l: 'Any' },
                { v: 'room' as const, l: '🛏 Room' },
                { v: 'studio' as const, l: '🏙 Studio' },
                { v: 'apartment' as const, l: '🏠 Apartment' },
              ].map((it) => {
                const on = draft.type === it.v;
                return (
                  <Pressable key={String(it.v)} onPress={() => setDraft({ ...draft, type: it.v })} style={[s.chip, on && s.chipOn]}>
                    <Text style={[s.chipText, on && s.chipTextOn]}>{it.l}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* OLX-style toggles */}
            <TriToggle label="🪑 Furnished" value={draft.furnished}
              onChange={(v) => setDraft({ ...draft, furnished: v })} />
            <TriToggle label="🐾 Pets allowed" value={draft.petsAllowed}
              onChange={(v) => setDraft({ ...draft, petsAllowed: v })} />
            <TriToggle label="⚡ Utilities included" value={draft.utilitiesIncluded}
              onChange={(v) => setDraft({ ...draft, utilitiesIncluded: v })} />

          </ScrollView>
          <Pressable onPress={() => { onApply(draft); onClose(); }} style={s.applyBtn}>
            <Text style={s.applyText}>Show results</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══ Map Placeholder ═══
// Replace this View with <MapView> once you run: npx expo install react-native-maps
function MapPlaceholder({ listings }: { listings: Listing[] }) {
  return (
    <View style={s.mapPlaceholder}>
      <Feather name="map" size={48} color={COLORS.muted} />
      <Text style={s.mapPlaceholderTitle}>Map View</Text>
      <Text style={s.mapPlaceholderSub}>
        Run{' '}
        <Text style={{ fontFamily: 'monospace', color: COLORS.primary }}>
          npx expo install react-native-maps
        </Text>
        {'\n'}then replace this component with {'<MapView>'}
      </Text>
      <View style={s.mapPinList}>
        {listings.map((l) => (
          <View key={l.id} style={s.mapPin}>
            <Feather name="map-pin" size={12} color={COLORS.primary} />
            <Text style={s.mapPinText}>{l.title} — {l.price} zł</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ═══ Main Screen ═══
type ViewMode = 'list' | 'map';

interface Props {
  city?: string;
  onListingPress?: (id: string) => void;
}

export default function BrowseListingsScreen({ city = 'Poznań', onListingPress }: Props) {
  const { t } = useT();
  const [sortMode, setSortMode]   = useState<SortMode>('newest');
  const [filters, setFilters]     = useState<Filters>(DEFAULT_FILTERS);
  const [sortOpen, setSortOpen]   = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode]   = useState<ViewMode>('list');

  const visibleListings = useMemo(() => {
    let result = MOCK_LISTINGS.filter((l) => l.city === city);
    result = result.filter((l) =>
      l.price >= filters.minPrice &&
      l.price <= filters.maxPrice &&
      (filters.rooms === null || l.rooms >= filters.rooms) &&
      (filters.type === null || l.type === filters.type) &&
      (filters.furnished === null || l.furnished === filters.furnished) &&
      (filters.petsAllowed === null || l.petsAllowed === filters.petsAllowed) &&
      (filters.utilitiesIncluded === null || l.utilitiesIncluded === filters.utilitiesIncluded)
    );
    if (sortMode === 'newest') result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortMode === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortMode === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [city, filters, sortMode]);

  const activeFilterCount =
    (filters.minPrice > 0 || filters.maxPrice < 5000 ? 1 : 0) +
    (filters.rooms !== null ? 1 : 0) +
    (filters.type !== null ? 1 : 0) +
    (filters.furnished !== null ? 1 : 0) +
    (filters.petsAllowed !== null ? 1 : 0) +
    (filters.utilitiesIncluded !== null ? 1 : 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>Listings</Text>
          <View style={s.cityChip}>
            <Feather name="map-pin" size={12} color={COLORS.primary} />
            <Text style={s.cityText}>{city}</Text>
          </View>
        </View>
        <View style={s.controlsRow}>
          <Pressable onPress={() => setFilterOpen(true)} style={[s.controlBtn, activeFilterCount > 0 && s.controlBtnActive]}>
            <Feather name="sliders" size={16} color={activeFilterCount > 0 ? '#fff' : COLORS.ink} />
            <Text style={[s.controlText, activeFilterCount > 0 && { color: '#fff' }]}>Filter</Text>
            {activeFilterCount > 0 && (
              <View style={s.controlBadge}>
                <Text style={s.controlBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
          {viewMode === 'list' && (
            <Pressable onPress={() => setSortOpen(true)} style={s.controlBtn}>
              <Feather name="bar-chart-2" size={16} color={COLORS.ink} />
              <Text style={s.controlText}>
                {sortMode === 'newest' ? 'Newest' : sortMode === 'price_asc' ? 'Price ↑' : 'Price ↓'}
              </Text>
            </Pressable>
          )}
          {/* List / Map toggle */}
          <View style={s.viewToggle}>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[s.viewToggleBtn, viewMode === 'list' && s.viewToggleBtnActive]}>
              <Feather name="list" size={15} color={viewMode === 'list' ? '#fff' : COLORS.soft} />
            </Pressable>
            <Pressable
              onPress={() => setViewMode('map')}
              style={[s.viewToggleBtn, viewMode === 'map' && s.viewToggleBtnActive]}>
              <Feather name="map" size={15} color={viewMode === 'map' ? '#fff' : COLORS.soft} />
            </Pressable>
          </View>
          <Text style={s.resultCount}>{visibleListings.length}</Text>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={visibleListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} onPress={() => onListingPress?.(item.id)} />}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="inbox" size={40} color={COLORS.muted} />
              <Text style={s.emptyTitle}>No listings found</Text>
              <Text style={s.emptyText}>Try adjusting your filters</Text>
            </View>
          }
        />
      ) : (
        <MapPlaceholder listings={visibleListings} />
      )}

      <SortMenu visible={sortOpen} current={sortMode} onClose={() => setSortOpen(false)} onSelect={setSortMode} />
      <FilterModal visible={filterOpen} filters={filters} onClose={() => setFilterOpen(false)} onApply={setFilters} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.6 },
  cityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: COLORS.tealLight },
  cityText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.line, backgroundColor: '#fff' },
  controlBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  controlText: { fontSize: 13, fontWeight: '600', color: COLORS.ink },
  controlBadge: { minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  controlBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  resultCount: { marginLeft: 'auto', fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADII.lg, marginBottom: 10, borderWidth: 1, borderColor: COLORS.line, overflow: 'hidden' },
  cardImageWrap: { width: 96, height: 96 },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { backgroundColor: COLORS.bgSoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.ink },
  cardDistrict: { fontSize: 12, color: COLORS.soft, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 11, color: COLORS.soft, fontWeight: '600' },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  cardPriceUnit: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  cardTag:  { backgroundColor: COLORS.bgSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  cardTagText: { fontSize: 10, color: COLORS.soft, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  sortSheet: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 32, paddingHorizontal: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginBottom: 12 },
  resetText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: RADII.md },
  sortRowOn: { backgroundColor: COLORS.tealLight },
  sortLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.ink },
  sortLabelOn: { color: COLORS.primary },
  filterSheet: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 32, maxHeight: '85%' },
  filterLabel: { fontSize: 13, fontWeight: '700', color: COLORS.ink, marginTop: 16, marginBottom: 10 },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceField: { flex: 1 },
  priceFieldLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', marginBottom: 4 },
  priceInput: { borderWidth: 1, borderColor: COLORS.line, borderRadius: RADII.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '600', color: COLORS.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.line, backgroundColor: '#fff' },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.ink },
  chipTextOn: { color: '#fff' },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginTop: 12 },
  emptyText: { fontSize: 13, color: COLORS.soft, marginTop: 4 },

  // List/Map toggle
  viewToggle: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, borderColor: COLORS.line, overflow: 'hidden', backgroundColor: '#fff' },
  viewToggleBtn: { padding: 7 },
  viewToggleBtnActive: { backgroundColor: COLORS.primary },

  // Map placeholder
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  mapPlaceholderTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginTop: 8 },
  mapPlaceholderSub: { fontSize: 13, color: COLORS.soft, textAlign: 'center', lineHeight: 20 },
  mapPinList: { alignSelf: 'stretch', gap: 8, marginTop: 8 },
  mapPin: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgSoft, borderRadius: 8, padding: 10 },
  mapPinText: { fontSize: 13, color: COLORS.ink, flex: 1 },
});
