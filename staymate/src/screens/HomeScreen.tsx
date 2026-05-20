// src/screens/HomeScreen.tsx — Discover/Swipe Matches
//
// Swipe-based card interface (Tinder-like)
// Shows match cards with profile, traits, and match score
// Tap heart/X to like/pass

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, GRADIENT, SHADOW, SPACING, RADII } from '../utils/constants';
import { Avatar } from '../components/Avatar';
import { useT } from '../i18n/translations';
import { TRAITS, traitLabel, TraitKey } from '../../traits';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W - SPACING.lg * 2;
const CARD_HEIGHT = SCREEN_H * 0.7;

interface MatchCard {
  id: string;
  name: string;
  age: number;
  bio: string;
  traits: TraitKey[];
  matchScore: number;
  location: string;
  avatar: string;
}

// Mock data
const MOCK_MATCHES: MatchCard[] = [
  {
    id: '1',
    name: 'Marta',
    age: 22,
    bio: 'UAM student, love cooking & hiking',
    traits: ['sosyal_biri', 'gevsek_temizlik', 'gece_kusu'],
    matchScore: 92,
    location: 'Poznań',
    avatar: 'M',
  },
  {
    id: '2',
    name: 'Alex',
    age: 23,
    bio: 'Quiet person, coffee addict',
    traits: ['sessiz_ortam', 'vegan', 'evcil_hayvan_yok'],
    matchScore: 87,
    location: 'Poznań',
    avatar: 'A',
  },
  {
    id: '3',
    name: 'Jana',
    age: 21,
    bio: 'Night owl, party person',
    traits: ['gece_kusu', 'sosyal_biri', 'disarida_icer'],
    matchScore: 78,
    location: 'Poznań',
    avatar: 'J',
  },
];

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCardComponent({
  match,
  onLike,
  onPass,
}: {
  match: MatchCard;
  onLike: () => void;
  onPass: () => void;
}) {
  const { lang } = useT();

  return (
    <View style={s.cardWrapper}>
      <LinearGradient
        colors={['rgba(31,191,204,0.1)', 'rgba(217,59,139,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.card}>
        {/* Header with avatar + name */}
        <View style={s.cardHeader}>
          <Avatar size={64} hue={0} label={match.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={s.nameRow}>
              <Text style={s.cardName}>
                {match.name}, {match.age}
              </Text>
              <LinearGradient
                colors={GRADIENT.brand as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.matchBadge}>
                <Text style={s.matchScore}>{match.matchScore}%</Text>
              </LinearGradient>
            </View>
            <Text style={s.cardLocation}>📍 {match.location}</Text>
          </View>
        </View>

        {/* Bio */}
        <Text style={s.cardBio}>{match.bio}</Text>

        {/* Traits */}
        <View style={s.traitsContainer}>
          {match.traits.map((trait) => (
            <View key={trait} style={s.traitTag}>
              <Text style={s.traitEmoji}>{TRAITS[trait].emoji}</Text>
              <Text style={s.traitText}>
                {traitLabel(trait, lang)}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <Pressable
            onPress={onPass}
            style={({ pressed }) => [
              s.actionBtn,
              s.pasBtn,
              pressed && { opacity: 0.8 },
            ]}>
            <Feather name="x" size={24} color={COLORS.error} />
          </Pressable>
          <Pressable
            onPress={onLike}
            style={({ pressed }) => [
              s.actionBtn,
              s.likeBtn,
              pressed && { opacity: 0.8 },
            ]}>
            <LinearGradient
              colors={GRADIENT.brand as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.likeBtnGradient}>
              <Feather name="heart" size={24} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Props {
  onMatchPress?: (id: string) => void;
}

export default function HomeScreen({ onMatchPress }: Props) {
  const { t } = useT();
  const [matches, setMatches] = useState<MatchCard[]>(MOCK_MATCHES);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = () => {
    const currentMatch = matches[currentIndex];
    onMatchPress?.(currentMatch.id);
    nextCard();
  };

  const handlePass = () => {
    nextCard();
  };

  const nextCard = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next < matches.length ? next : 0;
    });
  };

  if (matches.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={s.emptyContainer}>
          <Text style={s.emptyTitle}>No more matches!</Text>
          <Text style={s.emptySubtitle}>
            Come back later for more people
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Discover</Text>
        <Pressable style={s.filterBtn}>
          <Feather name="sliders" size={20} color={COLORS.secondary} />
        </Pressable>
      </View>

      {/* Card stack */}
      <View style={s.cardContainer}>
        {currentIndex < matches.length ? (
          <MatchCardComponent
            match={currentMatch}
            onLike={handleLike}
            onPass={handlePass}
          />
        ) : (
          <View style={s.emptyCard}>
            <Text style={s.emptyCardText}>No more matches</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      {currentIndex < matches.length && (
        <View style={s.stats}>
          <Text style={s.statsText}>
            {currentIndex + 1} of {matches.length}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '800',
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
    fontSize: 12,
  },
  cardLocation: {
    fontSize: 13,
    color: COLORS.soft,
    fontWeight: '500',
  },

  cardBio: {
    fontSize: 14,
    color: COLORS.ink,
    lineHeight: 20,
    marginVertical: 12,
  },

  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  traitTag: {
    backgroundColor: COLORS.bgSoft,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  traitEmoji: {
    fontSize: 14,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  pasBtn: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(229,72,77,0.1)',
  },
  likeBtn: {
    borderColor: 'transparent',
  },
  likeBtnGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgSoft,
  },
  emptyCardText: {
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: '600',
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
  },
  statsText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
});
