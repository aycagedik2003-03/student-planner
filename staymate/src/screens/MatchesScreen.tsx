// src/screens/MatchesScreen.tsx — Active Matches
//
// List of current active matches
// Shows last message, avatar, name, and match score
// Tap to open chat

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, GRADIENT, SHADOW, SPACING, RADII } from '../utils/constants';
import { Avatar } from '../components/Avatar';
import { matchService, type ActiveMatch } from '../api/MatchService';
import { useAppStore } from '../store';

interface Match {
  id: string;         // match ID (used for navigation)
  userId: string;     // matched user's ID (used for Chat navigation)
  name: string;
  age: number;
  lastMessage: string;
  lastMessageTime: string;
  matchScore: number;
  isNew: boolean;
  avatar: string;
}

function toMatch(m: ActiveMatch): Match {
  const user  = (m as any).matchedUser ?? (m as any).user ?? {};
  const name  = m.name ?? user.name ?? user.full_name ?? 'User';
  return {
    id:              m.id,
    userId:          user.id ?? m.id,
    name,
    age:             user.age ?? 0,
    avatar:          (name as string).charAt(0).toUpperCase(),
    lastMessage:     m.lastMessage ?? '—',
    lastMessageTime: m.lastMessageAt
      ? new Date(m.lastMessageAt).toLocaleDateString()
      : '',
    matchScore:      0,
    isNew:           (m.unreadCount ?? 0) > 0,
  };
}

// ─── Match Item ───────────────────────────────────────────────────────────────
function MatchItem({
  match,
  onPress,
}: {
  match: Match;
  onPress: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(match.id)}
      style={({ pressed }) => [
        s.matchItem,
        pressed && { opacity: 0.8 },
      ]}>
      <View style={s.matchItemContent}>
        <View style={{ position: 'relative' }}>
          <Avatar size={56} hue={0} label={match.avatar} />
          {match.isNew && <View style={s.newBadge} />}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={s.matchHeader}>
            <Text style={s.matchName}>
              {match.name}, {match.age}
            </Text>
            <LinearGradient
              colors={GRADIENT.brand as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.matchBadge}>
              <Text style={s.matchScore}>
                {match.matchScore}%
              </Text>
            </LinearGradient>
          </View>
          <Text
            style={s.lastMessage}
            numberOfLines={1}>
            {match.lastMessage}
          </Text>
          <Text style={s.timeStamp}>
            {match.lastMessageTime}
          </Text>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={COLORS.muted}
      />
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type FilterTab = 'All' | 'Unread';

export default function MatchesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [matches,     setMatches]     = useState<Match[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const load = useCallback(async () => {
    const token = useAppStore.getState().token ?? localStorage.getItem('userToken');
    if (!token) {
      console.log('[MatchesScreen] No token, skipping load');
      return;
    }
    setLoading(true);
    try {
      const raw = await matchService.getActive();
      setMatches(raw.map(toMatch));
    } catch (err: any) {
      if (__DEV__) console.warn('[MatchesScreen] getActive failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredMatches = matches.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || m.isNew;
    return matchesSearch && matchesFilter;
  });

  const handleMatchPress = (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) return;
    // Navigate to ChatList first so the back stack is populated,
    // then push ChatDetail on top — goBack() will return to ChatList.
    (navigation as any).navigate('Chat', { screen: 'ChatList' });
    setTimeout(() => {
      (navigation as any).navigate('Chat', {
        screen: 'ChatDetail',
        params: { chatId: match.userId, name: match.name, avatar_url: null },
      });
    }, 50);
  };

  const newCount = matches.filter((m) => m.isNew).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Matches</Text>
          {newCount > 0 && (
            <Text style={s.headerSubtitle}>
              {newCount} new message{newCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={s.searchSection}>
        <Feather
          name="search"
          size={18}
          color={COLORS.muted}
          style={{ marginRight: SPACING.sm }}
        />
        <TextInput
          placeholder="Search matches..."
          placeholderTextColor={COLORS.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={s.searchInput}
        />
      </View>

      {/* Filter tabs */}
      <View style={s.filterTabs}>
        {(['All', 'Unread'] as FilterTab[]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[s.filterTab, isActive && s.filterTabActive]}>
              <Text style={[s.filterTabText, isActive && s.filterTabTextActive]}>
                {filter}{filter === 'Unread' && newCount > 0 ? ` (${newCount})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      )}

      {/* Matches list */}
      {!loading && <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchItem match={item} onPress={handleMatchPress} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyTitle}>No matches found</Text>
            <Text style={s.emptySubtitle}>
              Check back later or explore more profiles
            </Text>
          </View>
        }
      />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },

  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    marginHorizontal: SPACING.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
  },

  filterTabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.soft,
  },
  filterTabTextActive: {
    color: '#fff',
  },

  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  matchItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  newBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: '#fff',
  },

  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
  },
  matchScore: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },

  lastMessage: {
    fontSize: 13,
    color: COLORS.soft,
    marginBottom: 2,
  },
  timeStamp: {
    fontSize: 11,
    color: COLORS.muted,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.soft,
    textAlign: 'center',
  },
});
