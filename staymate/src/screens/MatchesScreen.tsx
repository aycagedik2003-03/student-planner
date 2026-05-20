// src/screens/MatchesScreen.tsx — Active Matches
//
// List of current active matches
// Shows last message, avatar, name, and match score
// Tap to open chat

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, GRADIENT, SHADOW, SPACING, RADII } from '../utils/constants';
import { Avatar } from '../components/Avatar';

interface Match {
  id: string;
  name: string;
  age: number;
  lastMessage: string;
  lastMessageTime: string;
  matchScore: number;
  isNew: boolean;
  avatar: string;
}

// Mock data
const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Marta',
    age: 22,
    lastMessage: 'Sounds great! When can we meet?',
    lastMessageTime: '2 min ago',
    matchScore: 92,
    isNew: true,
    avatar: 'M',
  },
  {
    id: '2',
    name: 'Alex',
    age: 23,
    lastMessage: "I'm interested in the apartment",
    lastMessageTime: '1 hour ago',
    matchScore: 87,
    isNew: false,
    avatar: 'A',
  },
  {
    id: '3',
    name: 'Jana',
    age: 21,
    lastMessage: 'Thanks for liking my profile!',
    lastMessageTime: '3 hours ago',
    matchScore: 78,
    isNew: true,
    avatar: 'J',
  },
  {
    id: '4',
    name: 'Kasia',
    age: 20,
    lastMessage: 'See you next week!',
    lastMessageTime: 'Yesterday',
    matchScore: 85,
    isNew: false,
    avatar: 'K',
  },
  {
    id: '5',
    name: 'Tomek',
    age: 24,
    lastMessage: 'The room is still available',
    lastMessageTime: '2 days ago',
    matchScore: 82,
    isNew: false,
    avatar: 'T',
  },
];

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
interface Props {
  onMatchPress?: (id: string) => void;
}

export default function MatchesScreen({ onMatchPress }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = MOCK_MATCHES.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMatchPress = (id: string) => {
    onMatchPress?.(id);
  };

  const newCount = MOCK_MATCHES.filter((m) => m.isNew).length;

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
        {['All', 'Unread'].map((filter) => (
          <Pressable key={filter} style={s.filterTab}>
            <Text style={s.filterTabText}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      {/* Matches list */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchItem match={item} onPress={handleMatchPress} />
        )}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.emptyTitle}>No matches found</Text>
            <Text style={s.emptySubtitle}>
              Check back later or explore more profiles
            </Text>
          </View>
        }
      />
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
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.soft,
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
