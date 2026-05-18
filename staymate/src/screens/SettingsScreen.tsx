import React from 'react';
import {
  View, Text, TouchableOpacity, Pressable, StyleSheet, StatusBar,
  ScrollView, Switch, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { useTranslation } from '../i18n/useTranslation';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Props = { navigation: NavProp };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  green: '#10B981', greenBg: '#ECFDF5',
  red: '#EF4444', redBg: '#FEF2F2',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return <Text style={st.sLabel}>{label}</Text>;
}

function Row({
  icon, label, value, onPress, danger,
}: {
  icon: string; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={st.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[st.rowIconWrap, danger && st.rowIconWrapRed]}>
        <Text style={st.rowIcon}>{icon}</Text>
      </View>
      <Text style={[st.rowLabel, danger && st.rowLabelRed]}>{label}</Text>
      {value && <Text style={st.rowValue}>{value}</Text>}
      {!value && <Text style={st.rowChevron}>›</Text>}
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon, label, sub, value, onChange,
}: {
  icon: string; label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={st.row}>
      <View style={st.rowIconWrap}>
        <Text style={st.rowIcon}>{icon}</Text>
      </View>
      <View style={st.toggleLeft}>
        <Text style={st.rowLabel}>{label}</Text>
        {sub && <Text style={st.toggleSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.line, true: C.brandA + '88' }}
        thumbColor={value ? C.brandA : '#fff'}
      />
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }: Props) {
  const isVerified      = useAppStore(s => s.isVerified);
  const appSettings     = useAppStore(s => s.appSettings);
  const updateSetting   = useAppStore(s => s.updateSetting);
  const language        = useAppStore(s => s.language);
  const setLanguage     = useAppStore(s => s.setLanguage);
  const { t }           = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap', style: 'destructive',
          onPress: async () => {
            // 1. SecureStore token'ı sil
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

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount' as any);
  };

  const handleRateApp = () => {
    const appId = Platform.OS === 'ios' ? 'YOUR_APP_STORE_ID' : 'com.roomski.app';
    const url   = Platform.OS === 'ios'
      ? `https://apps.apple.com/app/id${appId}`
      : `https://play.google.com/store/apps/details?id=${appId}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('settings.rateApp'), t('settings.comingSoon'));
    });
  };

  const handlePlaceholder = (label: string) => {
    Alert.alert(label, t('settings.comingSoon'));
  };

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={st.header}>
        <Text style={st.hTitle}>{t('settings.title')}</Text>
        {isVerified && (
          <View style={st.verifiedPill}>
            <Text style={st.verifiedTxt}>{t('settings.verified')}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* ── Profil ── */}
        <SectionHeader label={t('settings.sectionProfile')} />
        <View style={st.card}>
          <Row icon="✏️" label={t('settings.editProfile')}
            onPress={() => navigation.navigate('ProfileEdit')} />
          <View style={st.rowDivider} />
          <Row icon="🎓"
            label={isVerified ? t('settings.verifiedStudent') : t('settings.verifyStudent')}
            onPress={() => navigation.navigate('Verification')} />
        </View>

        {/* ── Gizlilik ── */}
        <SectionHeader label={t('settings.sectionPrivacy')} />
        <View style={st.card}>
          <ToggleRow
            icon="🔒" label={t('settings.hideProfile')}
            sub={t('settings.hideProfileSub')}
            value={appSettings.profileHidden}
            onChange={v => updateSetting('profileHidden', v)}
          />
          <View style={st.rowDivider} />
          <Row icon="📄" label={t('settings.privacyPolicy')}
            onPress={() => navigation.navigate('PrivacyPolicy')} />
        </View>

        {/* ── Dil ── */}
        <SectionHeader label={t('settings.sectionLanguage')} />
        <View style={[st.card, { paddingVertical: 14, paddingHorizontal: 16 }]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([
              { code: 'pl' as const, label: 'Polski',  flag: '🇵🇱' },
              { code: 'tr' as const, label: 'Türkçe',  flag: '🇹🇷' },
              { code: 'en' as const, label: 'English', flag: '🇺🇸' },
            ]).map(lang => (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: language === lang.code ? C.tealBg : C.bgSoft,
                  borderWidth: language === lang.code ? 2 : 1,
                  borderColor: language === lang.code ? C.brandA : C.line,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{lang.flag}</Text>
                <Text style={{
                  fontSize: 11,
                  fontWeight: language === lang.code ? '700' : '400',
                  color: language === lang.code ? C.tealTx : C.mute,
                }}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Hesap ── */}
        <SectionHeader label={t('settings.sectionAccount')} />
        <View style={st.card}>
          <Row icon="✉️" label={t('settings.changeEmail')}
            onPress={() => navigation.navigate('ChangeEmail' as any)} />
          <View style={st.rowDivider} />
          <Row icon="🔑" label={t('settings.changePassword')}
            onPress={() => navigation.navigate('ChangePassword' as any)} />
          <View style={st.rowDivider} />
          <Row icon="🗑️" label={t('settings.deleteAccount')}
            onPress={handleDeleteAccount} danger />
        </View>

        {/* ── Yardım ── */}
        <SectionHeader label={t('settings.sectionHelp')} />
        <View style={st.card}>
          <Row icon="❓" label={t('settings.helpSupport')}
            onPress={() => navigation.navigate('Help' as any)} />
          <View style={st.rowDivider} />
          <Row icon="⭐" label={t('settings.rateApp')}
            onPress={handleRateApp} />
          <View style={st.rowDivider} />
          <Row icon="ℹ️" label={t('settings.about')}
            value="v2026.1.0"
            onPress={() => navigation.navigate('About' as any)} />
        </View>

        {/* ── Çıkış Yap ── */}
        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={st.logoutTxt}>🚪  {t('settings.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F3F5' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hTitle: { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  verifiedPill: {
    backgroundColor: C.greenBg, borderRadius: 999,
    paddingVertical: 4, paddingHorizontal: 12,
    borderWidth: 1, borderColor: C.green + '55',
  },
  verifiedTxt: { color: C.green, fontSize: 12, fontWeight: '700' },

  scroll: { paddingTop: 20, paddingHorizontal: 16 },

  sLabel: {
    color: C.mute, fontSize: 10.5, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase',
    marginBottom: 8, marginLeft: 4,
  },

  card: {
    backgroundColor: C.bg, borderRadius: 18,
    borderWidth: 1, borderColor: C.line,
    marginBottom: 22, overflow: 'hidden',
    shadowColor: '#1F2937', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 15, paddingHorizontal: 16,
  },
  rowDivider: { height: 1, backgroundColor: C.line, marginLeft: 52 },
  rowIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconWrapRed: { backgroundColor: C.redBg, borderColor: C.red + '44' },
  rowIcon:    { fontSize: 15 },
  rowLabel:   { flex: 1, color: C.ink, fontSize: 14.5, fontWeight: '500' },
  rowLabelRed: { color: C.red },
  rowValue:   { color: C.mute, fontSize: 13 },
  rowChevron: { color: C.mute, fontSize: 20 },

  toggleLeft: { flex: 1 },
  toggleSub:  { color: C.mute, fontSize: 11.5, marginTop: 1 },

  logoutBtn: {
    backgroundColor: C.bg, borderRadius: 18,
    borderWidth: 1.5, borderColor: C.red + '55',
    paddingVertical: 17, alignItems: 'center',
    marginBottom: 8,
    shadowColor: C.red, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  logoutTxt:  { color: C.red, fontSize: 15, fontWeight: '700' },

});
