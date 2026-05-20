// src/screens/ProfileScreen.tsx — User Profile (Claude Design)
//
// Complete redesign: Hero card + verify + language + traits + account sections
// Shows in BottomTabNavigator Me tab
// Uses useAuth() for logout

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, GRADIENT, RADII, SPACING, SHADOW } from '../utils/constants';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Avatar } from '../components/Avatar';
import { useT, setLanguage, Lang } from '../i18n/translations';
import { TRAITS, traitLabel, TraitKey } from '../../traits';

interface Props {
  user?: { name: string; bio?: string };
  traits?: TraitKey[];
  matchScore?: number;
  quizDone?: boolean;
  onEdit?: () => void;
  onVerifyStudent?: () => void;
  onSettings?: () => void;
  onPrivacy?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
  onSeeAllTraits?: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={s.statPill}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function TraitChip({
  k,
  lang,
}: {
  k: TraitKey;
  lang: Lang;
}) {
  return (
    <View style={s.traitChip}>
      <LinearGradient
        colors={['rgba(31,191,204,0.18)', 'rgba(217,59,139,0.18)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.traitEmojiDot}>
        <Text style={{ fontSize: 14 }}>
          {TRAITS[k].emoji}
        </Text>
      </LinearGradient>
      <Text style={s.traitLabel}>
        {traitLabel(k, lang)}
      </Text>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  danger = false,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#0001' }}
      style={({ pressed }) => [
        s.row,
        !last && s.rowBorder,
        pressed && Platform.OS === 'ios' && { opacity: 0.6 },
      ]}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        {icon}
      </View>
      <Text style={[s.rowLabel, danger && { color: COLORS.error }]}>
        {label}
      </Text>
      <Feather name="chevron-right" size={20} color={COLORS.muted} />
    </Pressable>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProfileScreen({
  user = { name: 'test' },
  traits = [
    'gece_kusu',
    'gevsek_temizlik',
    'sosyal_biri',
    'sessiz_ortam',
    'disarida_icer',
    'evcil_hayvan_yok',
    'vegan',
  ],
  matchScore = 92,
  quizDone = true,
  onEdit,
  onVerifyStudent,
  onSettings,
  onPrivacy,
  onHelp,
  onLogout,
  onSeeAllTraits,
}: Props) {
  const { t, lang } = useT();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('profile_title')}</Text>
          <Pill
            variant="ghost"
            size="sm"
            onPress={onEdit}
            leading={<Feather name="edit-2" size={12} color={COLORS.ink} />}>
            {t('profile_edit')}
          </Pill>
        </View>

        {/* Hero card */}
        <View style={s.heroWrap}>
          <Card
            padding={18}
            radius={RADII.xl}
            elevated
            style={{ overflow: 'hidden' }}>
            {/* Soft branded glow blobs */}
            <LinearGradient
              colors={[
                'rgba(31,191,204,0.22)',
                'rgba(142,92,217,0.10)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.blob, { left: -60, top: -40 }]}
            />
            <LinearGradient
              colors={[
                'rgba(217,59,139,0.20)',
                'rgba(142,92,217,0.10)',
              ]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[s.blob, { right: -60, top: -20 }]}
            />

            {/* Avatar + Name + Bio */}
            <View style={s.heroRow}>
              <View>
                <Avatar size={72} hue={0} label={user.name[0]} />
                <View style={s.avatarBadge}>
                  <Feather
                    name="edit-2"
                    size={11}
                    color={COLORS.secondary}
                  />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.userName}>{user.name}</Text>
                <View style={s.bioChip}>
                  <Feather
                    name="edit-2"
                    size={11}
                    color={COLORS.muted}
                  />
                  <Text style={s.bioChipText}>
                    {user.bio ?? t('profile_add_bio')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={s.statRow}>
              <StatPill
                value={String(traits.length)}
                label={t('profile_traits')}
              />
              <StatPill
                value={quizDone ? '✓' : '–'}
                label={t('profile_quiz_done')}
              />
              <StatPill
                value={`${matchScore}%`}
                label={t('profile_match')}
              />
            </View>
          </Card>
        </View>

        {/* Student verify card */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md }}>
          <Pressable
            onPress={onVerifyStudent}
            style={s.verifyCard}>
            <LinearGradient
              colors={['#FFF4E5', '#FFE5EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.verifyIcon}>
              <Ionicons
                name="school"
                size={20}
                color={COLORS.secondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.verifyTitle}>
                {t('profile_verify_title')}
              </Text>
              <Text style={s.verifySub}>
                {t('profile_verify_sub')}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.secondary}
            />
          </Pressable>
        </View>

        {/* Language selector */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
          <View style={s.sectionHeader}>
            <Ionicons
              name="globe-outline"
              size={18}
              color={COLORS.secondary}
            />
            <Text style={s.sectionHeaderText}>
              {t('profile_language')}
            </Text>
          </View>
          <View style={s.langGroup}>
            {([
              {
                code: 'pl' as Lang,
                flag: '🇵🇱',
                name: 'Polski',
              },
              {
                code: 'tr' as Lang,
                flag: '🇹🇷',
                name: 'Türkçe',
              },
              {
                code: 'en' as Lang,
                flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
                name: 'English',
              },
            ]).map((it) => {
              const on = it.code === lang;
              if (on) {
                return (
                  <LinearGradient
                    key={it.code}
                    colors={GRADIENT.brand as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[s.langItem, s.langItemOn]}>
                    <Pressable
                      onPress={() => setLanguage(it.code)}
                      style={{
                        alignItems: 'center',
                        gap: 2,
                      }}>
                      <Text style={{ fontSize: 20 }}>
                        {it.flag}
                      </Text>
                      <Text
                        style={[
                          s.langText,
                          { color: '#fff' },
                        ]}>
                        {it.name}
                      </Text>
                    </Pressable>
                  </LinearGradient>
                );
              }
              return (
                <Pressable
                  key={it.code}
                  onPress={() => setLanguage(it.code)}
                  style={s.langItem}>
                  <Text style={{ fontSize: 20 }}>
                    {it.flag}
                  </Text>
                  <Text style={s.langText}>
                    {it.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Traits section */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: 22 }}>
          <View style={s.eyebrowRow}>
            <Text style={s.eyebrow}>
              {t('profile_section_traits')}
            </Text>
            <Pressable onPress={onSeeAllTraits}>
              <Text style={s.eyebrowLink}>
                {t('profile_see_all')}
              </Text>
            </Pressable>
          </View>
          <View style={s.traitWrap}>
            {traits.map((k) => (
              <TraitChip key={k} k={k} lang={lang} />
            ))}
          </View>
        </View>

        {/* Account section */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: 22 }}>
          <Text
            style={[
              s.eyebrow,
              { marginBottom: 10, paddingHorizontal: 4 },
            ]}>
            {t('profile_section_account')}
          </Text>
          <View style={s.group}>
            <Row
              icon={
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={COLORS.secondary}
                />
              }
              label={t('profile_settings')}
              onPress={onSettings}
            />
            <Row
              icon={
                <Feather
                  name="lock"
                  size={20}
                  color={COLORS.secondary}
                />
              }
              label={t('profile_privacy')}
              onPress={onPrivacy}
            />
            <Row
              icon={
                <Feather
                  name="help-circle"
                  size={20}
                  color={COLORS.secondary}
                />
              }
              label={t('profile_help')}
              onPress={onHelp}
              last
            />
          </View>
          <View style={[s.group, { marginTop: 10 }]}>
            <Row
              icon={
                <Feather
                  name="log-out"
                  size={20}
                  color={COLORS.error}
                />
              }
              label={t('profile_logout')}
              onPress={onLogout}
              danger
              last
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },

  heroWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    opacity: 0.7,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  bioChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.bgSoft,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bioChipText: {
    color: COLORS.soft,
    fontSize: 13,
    fontWeight: '500',
  },

  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.soft,
    marginTop: 2,
    fontWeight: '500',
  },

  verifyCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217,59,139,0.18)',
  },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  verifyTitle: {
    fontWeight: '700',
    fontSize: 14.5,
    color: COLORS.ink,
  },
  verifySub: {
    fontSize: 12.5,
    color: COLORS.soft,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.ink,
  },

  langGroup: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.md,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  langItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    gap: 2,
  },
  langItemOn: {
    ...SHADOW.glow,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.soft,
  },

  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  eyebrow: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  eyebrowLink: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },

  traitWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitEmojiDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },

  group: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(142,92,217,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: 'rgba(229,72,77,0.10)',
  },
  rowLabel: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
    color: COLORS.ink,
  },
});
