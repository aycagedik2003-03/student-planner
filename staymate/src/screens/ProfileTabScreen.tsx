import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { useTranslation } from '../i18n/useTranslation';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Props = { navigation: NavProp };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', brandB: '#FF9ACD',
  tealBg: '#E6FBFA', tealTx: '#00A8A2',
  pinkBg: '#FFF0F7',
  darkBg: '#1A1C22',
  green: '#10B981', greenBg: '#ECFDF5', greenTx: '#059669',
};

type TraitColor = 'teal' | 'pink' | 'dark';
interface Trait { icon: string; label: string; color: TraitColor }

function deriveTraits(a: (number | null)[]): Trait[] {
  const get = (i: number) => a[i] ?? -1;
  const traits: Trait[] = [];
  if (get(0) === 1 || get(0) === 2) traits.push({ icon: '🌙', label: 'Gece kuşu', color: 'pink' });
  else if (get(0) === 0) traits.push({ icon: '☀️', label: 'Erken kalkan', color: 'teal' });
  if (get(3) === 0 || get(3) === 1) traits.push({ icon: '✨', label: 'Düzenli', color: 'teal' });
  if (get(6) === 0 || get(6) === 1) traits.push({ icon: '🤝', label: 'Sosyal', color: 'pink' });
  else if (get(6) === 2 || get(6) === 3) traits.push({ icon: '🧘', label: 'İçe dönük', color: 'teal' });
  if (get(9) === 0) traits.push({ icon: '🏠', label: 'Remote', color: 'teal' });
  if (get(12) === 0) traits.push({ icon: '🐾', label: 'Evcil hayvanlı', color: 'pink' });
  if (get(13) === 1) traits.push({ icon: '🚭', label: 'Sigara içmez', color: 'teal' });
  if (get(14) === 3) traits.push({ icon: '🫖', label: 'Alkol almaz', color: 'teal' });
  if (get(15) === 0 || get(15) === 1) traits.push({ icon: '🍳', label: 'Ev yemeği', color: 'teal' });
  return traits;
}

export default function ProfileTabScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const setLanguage  = useAppStore(s => s.setLanguage);
  const quizAnswers  = useAppStore(s => s.quizAnswers);
  const quizCity     = useAppStore(s => s.quizCity);
  const isVerified   = useAppStore(s => s.isVerified);
  const storeProfile = useAppStore(s => s.profile);

  // Profil verileri: API'dan gelen > quiz > fallback
  const displayName = storeProfile?.name ?? 'Kullanıcı';
  const displayCity = storeProfile?.city ?? quizCity ?? null;
  const displayUni  = storeProfile?.university ?? null;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Trait'ler: backend > quiz
  const traits: Trait[] =
    storeProfile?.traits && storeProfile.traits.length > 0
      ? storeProfile.traits.slice(0, 8).map(t => ({
          icon:  '✦',
          label: t,
          color: 'teal' as TraitColor,
        }))
      : deriveTraits(quizAnswers);

  const bgMap: Record<TraitColor, string> = { teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4' };
  const txMap: Record<TraitColor, string> = { teal: '#fff',    pink: '#fff',    dark: '#fff'    };
  const bdMap: Record<TraitColor, string> = { teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4' };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'), style: 'destructive',
          onPress: async () => {
            await authService.logout();
            const store = useAppStore.getState();
            store.clearUser();
            store.resetFilters();
            store.setQuizAnswers([]);
            store.setVerified(false);
            store.clearFilteredMatches();
            store.setProfile(null);
            store.setActiveMatches([]);
            navigation.reset({ index: 0, routes: [{ name: 'Auth' as any }] });
          },
        },
      ],
    );
  };

  const SETTINGS = [
    { icon: '⚙️',  label: t('settings.title'),      onPress: () => navigation.navigate('Settings' as any), danger: false },
    { icon: '🔒', label: t('settings.privacy'),     onPress: () => navigation.navigate('Settings' as any), danger: false },
    { icon: '💬', label: t('settings.helpSupport'), onPress: () => navigation.navigate('Help' as any),     danger: false },
    { icon: '🚪', label: t('settings.logout'),      onPress: handleLogout,                                 danger: true  },
  ];

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <Text style={st.hTitle}>{t('tabs.profile')}</Text>
        <TouchableOpacity
          style={st.editBtn}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.7}
        >
          <Text style={st.editTxt}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Hero */}
        <View style={st.hero}>
          <View style={st.heroBlob1} /><View style={st.heroBlob2} />
          <View style={st.avatarWrap}>
            <View style={st.avatar}>
              <Text style={st.avatarTxt}>{avatarLetter}</Text>
            </View>
            {isVerified && (
              <View style={st.badge}><Text style={st.badgeTxt}>✓</Text></View>
            )}
          </View>

          <Text style={st.name}>{displayName}</Text>
          <Text style={st.sub}>
            {[
              storeProfile?.age ? `${storeProfile.age} yaşında` : null,
              displayCity,
            ].filter(Boolean).join(' · ') || 'Profil bilgisi yok'}
          </Text>

          <View style={st.infoRow}>
            {displayUni && (
              <View style={st.chip}><Text style={st.chipTxt}>🎓 {displayUni}</Text></View>
            )}
            {isVerified && (
              <View style={[st.chip, st.verifiedChip]}>
                <Text style={st.verifiedChipTxt}>✓ Doğrulanmış</Text>
              </View>
            )}
          </View>

          <View style={st.scorePill}>
            <Text style={st.scoreTxt}>✦ {traits.length} {t('profile.traits')} · {t('profile.quizDone')}</Text>
          </View>

          {!isVerified && (
            <TouchableOpacity
              style={st.verifyBtn}
              onPress={() => navigation.navigate('Verification')}
              activeOpacity={0.85}
            >
              <Text style={st.verifyBtnTxt}>🎓 {t('settings.verifyStudent')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dil seçici */}
        <View style={st.langCard}>
          <Text style={st.langTitle}>🌐 {t('settings.language')}</Text>
          <View style={st.langRow}>
            {([
              { code: 'pl' as const, short: 'PL', flag: '🇵🇱' },
              { code: 'tr' as const, short: 'TR', flag: '🇹🇷' },
              { code: 'en' as const, short: 'EN', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            ]).map(lang => (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[st.langBtn, language === lang.code && st.langBtnActive]}
              >
                <Text style={{ fontSize: 18, marginBottom: 2 }}>{lang.flag}</Text>
                <Text style={[st.langBtnTxt, language === lang.code && st.langBtnTxtActive]}>
                  {lang.short}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Traits */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>{t('profile.traitsLabel')}</Text>
          <View style={st.grid}>
            {traits.length > 0 ? (
              traits.map((trait, i) => (
                <LinearGradient
                  key={i}
                  colors={['rgba(0,188,212,0.15)', 'rgba(233,30,99,0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={st.traitCard}
                >
                  <Text style={st.traitIcon}>{trait.icon}</Text>
                  <Text style={st.traitLabel}>{t(`traits.${trait.label.toLowerCase().replace(/[- ]/g,'_')}`) || trait.label}</Text>
                </LinearGradient>
              ))
            ) : (
              <View style={st.emptyCard}>
                <Text style={st.emptyTxt}>{t('quiz.notCompleted')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={st.settingsSection}>
          <Text style={st.sectionLabel}>{t('settings.sectionAccount')}</Text>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[st.settingsRow, item.danger && st.logoutRow]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={st.settingsIcon}>{item.icon}</Text>
              <Text style={[st.settingsLabel, item.danger && st.logoutLabel]}>
                {item.label}
              </Text>
              <Text style={st.settingsChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 30 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  hTitle:  { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  editTxt: { color: C.brandA, fontSize: 14, fontWeight: '600' },

  hero: {
    alignItems: 'center', paddingTop: 20, paddingBottom: 20,
    paddingHorizontal: 24, overflow: 'hidden', position: 'relative',
  },
  heroBlob1: { position: 'absolute', width: 240, height: 240, borderRadius: 999, backgroundColor: C.brandA, top: -90, left: -70, opacity: 0.1 },
  heroBlob2: { position: 'absolute', width: 240, height: 240, borderRadius: 999, backgroundColor: C.brandB, top: -70, right: -70, opacity: 0.1 },

  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 999, backgroundColor: C.brandA,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  avatarTxt: { color: '#fff', fontSize: 32, fontWeight: '800' },
  badge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 999, backgroundColor: C.green,
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  name: { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sub:  { color: C.soft, fontSize: 13, marginTop: 3 },

  infoRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  chipTxt:       { color: C.soft, fontSize: 12 },
  verifiedChip:  { backgroundColor: C.greenBg, borderColor: C.green + '55' },
  verifiedChipTxt: { color: C.greenTx, fontSize: 11, fontWeight: '700' },

  scorePill: { backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginTop: 12 },
  scoreTxt:  { color: C.tealTx, fontSize: 12, fontWeight: '600' },

  verifyBtn: {
    marginTop: 14, backgroundColor: '#FFF7E6',
    borderRadius: 999, borderWidth: 1.5, borderColor: '#F59E0B',
    paddingVertical: 10, paddingHorizontal: 20,
  },
  verifyBtnTxt: { color: '#B45309', fontSize: 12, fontWeight: '700' },

  section:      { paddingHorizontal: 18, paddingTop: 20 },
  sectionLabel: { color: C.mute, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  traitCard:    { width: '47%', flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,188,212,0.3)', paddingVertical: 12, paddingHorizontal: 12, gap: 8 },
  traitIcon:    { fontSize: 18 },
  traitLabel:   { fontSize: 13, fontWeight: '600', flex: 1, color: '#00BCD4' },
  emptyCard:    { width: '100%', padding: 20, alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: 16, borderWidth: 1, borderColor: C.line },
  emptyTxt:     { color: C.mute, fontSize: 14 },

  langCard:       { marginHorizontal: 18, marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(31,41,55,0.08)' },
  langTitle:      { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  langRow:        { flexDirection: 'row', gap: 10 },
  langBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  langBtnActive:  { backgroundColor: '#00BCD4', borderColor: '#00BCD4' },
  langBtnTxt:     { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  langBtnTxtActive:{ color: '#fff' },
  settingsSection: { paddingHorizontal: 18, paddingTop: 24 },
  settingsRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.bgSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8 },
  logoutRow:       { backgroundColor: '#FEF2F2', borderColor: '#EF444433' },
  settingsIcon:    { fontSize: 18 },
  settingsLabel:   { flex: 1, color: C.ink, fontSize: 14, fontWeight: '500' },
  logoutLabel:     { color: '#EF4444' },
  settingsChevron: { color: C.mute, fontSize: 20 },
});
