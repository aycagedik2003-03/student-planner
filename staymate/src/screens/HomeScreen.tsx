// src/screens/HomeScreen.tsx — Discover / Swipe Matches

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADII } from '../utils/constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useT } from '../i18n/translations';
import { useAppStore } from '../store';
import { matchService } from '../api/MatchService';
import { filterService, type FilterOptions } from '../api/FilterService';
import FilterModalScreen from './FilterModalScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  match_id?: string;
  name: string | null;
  age: number | null;
  city: string | null;
  university: string | null;
  avatar_url: string | null;
  bio: string | null;
  traits: string[];
  match_score: number | null;
  is_online: boolean;
  price_min?: number | null;
  price_max?: number | null;
  room_type?: string | null;
  amenities?: string[];
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCardComponent({
  suggestion,
  onLike,
  onPass,
  onSuperLike,
}: {
  suggestion: Suggestion;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike?: (id: string) => void;
}) {
  const { t } = useT();

  const getInitials = (name: string | null) =>
    name && typeof name === 'string' ? name.trim().charAt(0).toUpperCase() : '?';

  const score = suggestion.match_score;

  return (
    <>
      <View style={mcStyles.card}>

        {/* ─── ÜST GRADIENT ALAN ─── */}
        <View style={mcStyles.cardTop}>
          {suggestion.avatar_url ? (
            <Image
              source={{ uri: suggestion.avatar_url }}
              style={mcStyles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#9B7FFF', '#C875D8', '#E898C8']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={mcStyles.cardImage}
            >
              <Text style={mcStyles.avatarInitial}>{getInitials(suggestion.name)}</Text>
            </LinearGradient>
          )}

          {/* Online rozet */}
          <View style={mcStyles.onlineBadge}>
            <View style={mcStyles.onlineDot} />
            <Text style={mcStyles.onlineText}>online</Text>
          </View>

          {/* Match % rozet */}
          {score != null && (
            <View style={mcStyles.scoreBadge}>
              <Text style={mcStyles.scoreNum}>{Math.round(score)}</Text>
              <Text style={mcStyles.scorePct}>%</Text>
            </View>
          )}

          {/* İsim + meta overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={mcStyles.nameOverlay}
          >
            <View style={mcStyles.nameRow}>
              <Text style={mcStyles.nameText}>
                {suggestion.name || t('unknown')}
                {suggestion.age ? `, ${suggestion.age}` : ''}
              </Text>
              <Text style={mcStyles.verifiedBadge}>✓</Text>
            </View>
            <View style={mcStyles.metaRow}>
              {suggestion.university ? (
                <Text style={mcStyles.metaText}>🎓 {suggestion.university}</Text>
              ) : null}
              {suggestion.city ? (
                <Text style={mcStyles.metaText}>📍 {suggestion.city}</Text>
              ) : null}
            </View>
          </LinearGradient>
        </View>

        {/* ─── ALT BEYAZ ALAN ─── */}
        <View style={mcStyles.cardBottom}>
          {suggestion.bio ? (
            <Text style={mcStyles.bioText}>{suggestion.bio}</Text>
          ) : null}

          {suggestion.traits.length > 0 && (
            <View>
              <Text style={mcStyles.sectionLabel}>{t('sharedTraits')}</Text>
              <View style={mcStyles.traitsGrid}>
                {suggestion.traits.slice(0, 4).map((trait, i) => (
                  <View key={i} style={mcStyles.traitPill}>
                    <Text style={mcStyles.traitText} numberOfLines={1}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ─── ACTION BUTTONS ─── */}
      <View style={mcStyles.actionsRow}>
        <TouchableOpacity onPress={() => onPass(suggestion.id)} style={mcStyles.btnPass}>
          <Text style={{ fontSize: 24, color: '#FF6B6B' }}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSuperLike?.(suggestion.id)} style={mcStyles.btnSuperLike}>
          <Text style={{ fontSize: 22 }}>⭐</Text>
        </TouchableOpacity>

        <LinearGradient colors={['#7C5CFF', '#C875D8']} style={mcStyles.btnLike}>
          <TouchableOpacity
            onPress={() => onLike(suggestion.id)}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 24 }}>♥</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
  onMatchPress?: (id: string) => void;
}

export default function HomeScreen({ onMatchPress }: Props) {
  const { t } = useT();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile  = useAppStore(s => s.profile);
  const quizCity = useAppStore(s => s.quizCity);

  const [suggestions,         setSuggestions]         = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [currentIndex,        setCurrentIndex]        = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilters,     setCurrentFilters]     = useState<FilterOptions>({});

  const applyFilters = useCallback((data: Suggestion[], filters: FilterOptions) => {
    const filtered = filterService.filterSuggestions(data, filters) as Suggestion[];
    setFilteredSuggestions(filtered);
  }, []);

  const loadSavedFilters = useCallback(async () => {
    try {
      const saved = await filterService.getFilters();
      setCurrentFilters(saved);
      return saved;
    } catch {
      return {};
    }
  }, []);

  const loadSuggestions = useCallback(async (filters?: FilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const userCity = profile?.city ?? quizCity ?? 'Poznań';
      if (__DEV__) console.log('[HomeScreen] Loading suggestions for city:', userCity);

      const rawData = await matchService.getSuggestions(userCity);
      if (__DEV__) console.log('[HomeScreen] Suggestions count:', rawData.length);

      const normalized: Suggestion[] = rawData.map((item: any) => {
        const p = item.profile || item;
        return {
          id:          p.id         ?? String(Math.random()),
          match_id:    item.match_id,
          name:        p.name       || null,
          age:         p.age        || null,
          city:        p.city       || null,
          university:  p.university || null,
          avatar_url:  p.avatar_url || null,
          bio:         p.bio        || null,
          traits:      Array.isArray(p.traits) ? p.traits : [],
          match_score: item.compatibility_score ?? item.match_score ?? item.score ?? null,
          is_online:   p.is_online  ?? false,
          price_min:   p.price_min  ?? null,
          price_max:   p.price_max  ?? null,
          room_type:   p.room_type  ?? null,
          amenities:   Array.isArray(p.amenities) ? p.amenities : [],
        };
      });

      if (__DEV__) {
        console.log('[Debug] İlk profil:', JSON.stringify(normalized[0], null, 2));
        console.log('[Debug] Trait sayısı:', normalized.map(s => ({ name: s.name, traits: s.traits.length, avatar: s.avatar_url })));
      }

      setSuggestions(normalized);
      setCurrentIndex(0);
      applyFilters(normalized, filters ?? currentFilters);
    } catch (err: any) {
      if (__DEV__) console.warn('[HomeScreen] getSuggestions failed:', err.message);
      setError(err.message ?? 'error');
      setSuggestions([]);
      setFilteredSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, applyFilters, profile?.city, quizCity]);

  useFocusEffect(
    useCallback(() => {
      const token = useAppStore.getState().token ?? localStorage.getItem('userToken');
      if (!token) {
        console.log('[HomeScreen] No token, skipping load');
        return;
      }
      loadSavedFilters().then(saved => loadSuggestions(saved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const advanceCard = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    setFilteredSuggestions(prev => {
      const next = prev.filter(s => s.id !== id);
      setCurrentIndex(i => (i >= next.length && next.length > 0 ? next.length - 1 : i >= next.length ? 0 : i));
      return next;
    });
  };

  const handleLike = async (id: string) => {
    if (!filteredSuggestions.length) return;
    const item = filteredSuggestions[currentIndex];
    if (!item) { setCurrentIndex(0); return; }
    advanceCard(item.id);
    onMatchPress?.(item.id);
    if (item.match_id) {
      try { await matchService.likeMatch(item.match_id); } catch { /* best-effort */ }
    }
  };

  const handlePass = async (id: string) => {
    if (!filteredSuggestions.length) return;
    const item = filteredSuggestions[currentIndex];
    if (!item) { setCurrentIndex(0); return; }
    advanceCard(item.id);
    if (item.match_id) {
      try { await matchService.passMatch(item.match_id); } catch { /* best-effort */ }
    }
  };

  const handleSuperLike = (id: string) => {
    if (!filteredSuggestions.length) return;
    const item = filteredSuggestions[currentIndex];
    if (!item) { setCurrentIndex(0); return; }
    advanceCard(item.id);
  };

  const handleFilterApply = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    applyFilters(suggestions, filters);
  };

  const handleResetFilters = async () => {
    setCurrentFilters({});
    applyFilters(suggestions, {});
    await filterService.resetFilters();
  };

  const activeFilterCount = filterService.getActiveFilterCount(currentFilters);
  const isFiltersActive   = filterService.isFiltersActive(currentFilters);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={s.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[s.emptySubtitle, { marginTop: 16 }]}>{t('loading_suggestions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────

  if (filteredSuggestions.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>{t('discover')}</Text>
            <Text style={s.headerSubtitle}>{t('discoverSubtitle')}</Text>
          </View>
          <TouchableOpacity
            style={[s.filterBtn, activeFilterCount > 0 && s.filterBtnActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="sliders" size={20} color={activeFilterCount > 0 ? '#7C5CFF' : COLORS.secondary} />
            {activeFilterCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.emptyContainer}>
          <Text style={{ fontSize: 48 }}>{isFiltersActive ? '🔍' : '🎉'}</Text>
          <Text style={s.emptyTitle}>
            {error ? t('connection_error') : isFiltersActive ? t('noMatchesFilters') : t('all_seen')}
          </Text>
          <Text style={s.emptySubtitle}>{error ? error : isFiltersActive ? '' : t('new_suggestions_soon')}</Text>

          {isFiltersActive ? (
            <Pressable
              onPress={handleResetFilters}
              style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
                backgroundColor: '#7C5CFF', borderRadius: RADII.pill }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('resetFilters')}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => loadSuggestions()}
              style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
                backgroundColor: COLORS.primary, borderRadius: RADII.pill }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('refresh')} 🔄</Text>
            </Pressable>
          )}
        </View>

        <FilterModalScreen
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterApply}
        />
      </SafeAreaView>
    );
  }

  // ── Normal ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('discover')}</Text>
          <Text style={s.headerSubtitle}>
            {filteredSuggestions.length} {t('available')}
            {isFiltersActive ? ` · ${t('filtered')}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.filterBtn, activeFilterCount > 0 && s.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Feather name="sliders" size={20} color={activeFilterCount > 0 ? '#7C5CFF' : COLORS.secondary} />
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Card + Actions */}
      <View style={s.cardContainer}>
        <MatchCardComponent
          suggestion={filteredSuggestions[currentIndex]}
          onLike={handleLike}
          onPass={handlePass}
          onSuperLike={handleSuperLike}
        />
      </View>

      {/* Counter */}
      <View style={s.stats}>
        <Text style={s.statsText}>
          {t('suggestions_count').replace('{count}', String(filteredSuggestions.length))}
        </Text>
      </View>

      {/* Filter Modal */}
      <FilterModalScreen
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#F0ECFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  cardContainer: {
    flex: 1,
    paddingBottom: SPACING.md,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.soft,
    textAlign: 'center',
  },

  stats: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingBottom: 100,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
});

// ─── Card styles ──────────────────────────────────────────────────────────────

const mcStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  cardTop: { width: '100%', height: 360, position: 'relative' },
  cardImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 120, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },

  onlineBadge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10, gap: 5,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71' },
  onlineText: { fontSize: 12, fontWeight: '600', color: '#333' },

  scoreBadge: {
    position: 'absolute', top: 12, right: 14,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2.5, borderColor: '#7C5CFF',
  },
  scoreNum: { fontSize: 17, fontWeight: '800', color: '#1a1a2e' },
  scorePct: { fontSize: 9, fontWeight: '700', color: '#7C5CFF', marginTop: 5 },

  nameOverlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nameText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  verifiedBadge: { fontSize: 15, color: '#4FC3F7' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

  cardBottom: { padding: 16 },
  bioText: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#bbb',
    letterSpacing: 0.8, marginBottom: 10,
  },
  traitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitPill: {
    width: '48%', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
  },
  traitText: { fontSize: 13, color: '#333', fontWeight: '500' },

  actionsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 20, paddingVertical: 16,
  },
  btnPass: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#FF6B6B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B6B', shadowOpacity: 0.15,
    shadowRadius: 8, elevation: 3,
  },
  btnSuperLike: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#FFA726',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFA726', shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 3,
  },
  btnLike: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFF', shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
});
