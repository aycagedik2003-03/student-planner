import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { profileService } from '../api/ProfileService';
import { verificationService } from '../api/VerificationService';
import { useTranslation } from '../i18n/useTranslation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      '#FFFFFF',
  bgSoft:  '#FAFAFA',
  ink:     '#1F2937',
  soft:    '#4B5563',
  mute:    '#9CA3AF',
  line:    'rgba(31,41,55,0.08)',
  turq:    '#00CFC8',
  turq50:  '#E6FBFA',
  turqTx:  '#00A8A2',
  rose:    '#FF9ACD',
  rose50:  '#FFF0F7',
  green:   '#10B981',
  greenBg: '#ECFDF5',
  greenTx: '#059669',
  error:   '#EF4444',
};

// ── Trait data ────────────────────────────────────────────────────────────────

// Icon lookup — backend key → emoji
const TRAIT_ICON: Record<string, string> = {
  gece_kusu: '🌙', erken_kalkan: '☀️', normal_uyku: '😴',
  duzenli: '✨', orta_temizlik: '🧹', rahat: '😌', dagincik: '🎨',
  sosyal: '🤝', sessiz: '🤫', gurultuye_acik: '🔊', sessiz_ortam: '🔇',
  icedonuk: '🧘', remote: '🏠', hybrid: '💻', evde_calisir: '🏠',
  kutuphanede_calisir: '📚', gece_calisir: '🦉',
  evcil_hayvan: '🐾', evcil_hayvan_yok: '🚫', hayvan_sever: '🐾',
  sigara_icmez: '🚭', sigara: '🚬',
  alkol_yok: '🫖', sosyal_ici: '🥂', nadir_ici: '🍷',
  ev_yemegi: '🍳', vegan: '🥦', vejeteryan: '🥗',
  helal_beslenme: '🍖', kisitlama_yok: '🍽️',
};

// Multilingual labels — direct map (no t() needed, avoids raw key display)
const TRAIT_LABELS: Record<string, Record<string, string>> = {
  tr: {
    gece_kusu: 'Gece kuşu', erken_kalkan: 'Erken kalkan', normal_uyku: 'Normal uyku',
    duzenli: 'Düzenli', orta_temizlik: 'Orta temizlik', rahat: 'Rahat', dagincik: 'Rahat & dağınık',
    sosyal: 'Sosyal', sessiz: 'Sessiz & sakin', gurultuye_acik: 'Gürültüye açık',
    sessiz_ortam: 'Sessiz ortam sever', icedonuk: 'İçe dönük',
    remote: 'Remote', hybrid: 'Hybrid', evde_calisir: 'Evde çalışır',
    kutuphanede_calisir: 'Kütüphanede çalışır', gece_calisir: 'Gece çalışır',
    evcil_hayvan: 'Evcil hayvanlı', evcil_hayvan_yok: 'Evcil hayvan yok',
    hayvan_sever: 'Hayvan sever', sigara_icmez: 'Sigara içmez', sigara: 'Sigara içer',
    alkol_yok: 'Alkol almaz', sosyal_ici: 'Sosyal içici', nadir_ici: 'Nadir içer',
    ev_yemegi: 'Ev yemeği yapar', vegan: 'Vegan', vejeteryan: 'Vejetaryen',
    helal_beslenme: 'Helal beslenme', kisitlama_yok: 'Kısıtlama yok',
  },
  pl: {
    gece_kusu: 'Nocny marek', erken_kalkan: 'Ranny ptaszek', normal_uyku: 'Normalny rytm snu',
    duzenli: 'Schludny', orta_temizlik: 'Średnia czystość', rahat: 'Luźny', dagincik: 'Swobodny',
    sosyal: 'Towarzyski', sessiz: 'Spokojny', gurultuye_acik: 'Toleruje hałas',
    sessiz_ortam: 'Lubi ciszę', icedonuk: 'Introwertyczny',
    remote: 'Praca zdalna', hybrid: 'Hybrydowy', evde_calisir: 'Uczy się w domu',
    kutuphanede_calisir: 'Uczy się w bibliotece', gece_calisir: 'Pracuje w nocy',
    evcil_hayvan: 'Ma zwierzę', evcil_hayvan_yok: 'Bez zwierząt',
    hayvan_sever: 'Lubi zwierzęta', sigara_icmez: 'Niepalący', sigara: 'Palący',
    alkol_yok: 'Niepijący', sosyal_ici: 'Pije towarzysko', nadir_ici: 'Rzadko pije',
    ev_yemegi: 'Gotuje w domu', vegan: 'Weganin', vejeteryan: 'Wegetarianin',
    helal_beslenme: 'Dieta halal', kisitlama_yok: 'Brak ograniczeń',
  },
  en: {
    gece_kusu: 'Night owl', erken_kalkan: 'Early bird', normal_uyku: 'Normal sleep',
    duzenli: 'Tidy', orta_temizlik: 'Average cleanliness', rahat: 'Relaxed', dagincik: 'Relaxed & messy',
    sosyal: 'Social', sessiz: 'Quiet & calm', gurultuye_acik: 'Noise tolerant',
    sessiz_ortam: 'Prefers quiet', icedonuk: 'Introverted',
    remote: 'Remote worker', hybrid: 'Hybrid', evde_calisir: 'Studies at home',
    kutuphanede_calisir: 'Studies at library', gece_calisir: 'Night worker',
    evcil_hayvan: 'Has a pet', evcil_hayvan_yok: 'No pets',
    hayvan_sever: 'Pet lover', sigara_icmez: 'Non-smoker', sigara: 'Smoker',
    alkol_yok: 'Non-drinker', sosyal_ici: 'Social drinker', nadir_ici: 'Rare drinker',
    ev_yemegi: 'Home cook', vegan: 'Vegan', vejeteryan: 'Vegetarian',
    helal_beslenme: 'Halal diet', kisitlama_yok: 'No restrictions',
  },
};

// Readable label → snake_case key lookup
const LABEL_TO_KEY: Record<string, string> = {
  'gece kuşu': 'gece_kusu', 'erken kalkan': 'erken_kalkan', 'düzenli': 'duzenli',
  'rahat': 'rahat', 'sosyal': 'sosyal', 'içe dönük': 'icedonuk', 'remote': 'remote',
  'hybrid': 'hybrid', 'gece çalışır': 'gece_calisir', 'evcil hayvanlı': 'evcil_hayvan',
  'hayvan sever': 'hayvan_sever', 'sigara içmez': 'sigara_icmez', 'sigara içer': 'sigara',
  'alkol almaz': 'alkol_yok', 'sosyal içici': 'sosyal_ici', 'nadir içer': 'nadir_ici',
  'ev yemeği yapar': 'ev_yemegi',
};

function deriveTraitsFromAnswers(a: (number | null)[]): Array<{ icon: string; label: string }> {
  const get = (i: number) => a[i] ?? -1;
  const out: Array<{ icon: string; label: string }> = [];
  if (get(0) === 1 || get(0) === 2) out.push({ icon: '🌙', label: 'Gece kuşu' });
  else if (get(0) === 0)            out.push({ icon: '☀️', label: 'Erken kalkan' });
  if (get(3) === 0 || get(3) === 1) out.push({ icon: '✨', label: 'Düzenli' });
  else if (get(3) === 3)            out.push({ icon: '😌', label: 'Rahat' });
  if (get(6) === 0 || get(6) === 1) out.push({ icon: '🤝', label: 'Sosyal' });
  else if (get(6) >= 2)             out.push({ icon: '🧘', label: 'İçe dönük' });
  if (get(9) === 0)                 out.push({ icon: '🏠', label: 'Remote' });
  else if (get(9) === 3)            out.push({ icon: '💻', label: 'Hybrid' });
  if (get(12) === 0)                out.push({ icon: '🐾', label: 'Evcil hayvanlı' });
  if (get(13) === 1)                out.push({ icon: '🚭', label: 'Sigara içmez' });
  else if (get(13) === 0)           out.push({ icon: '🚬', label: 'Sigara içer' });
  if (get(14) === 3)                out.push({ icon: '🫖', label: 'Alkol almaz' });
  else if (get(14) === 1)           out.push({ icon: '🥂', label: 'Sosyal içici' });
  if (get(15) === 0 || get(15) === 1) out.push({ icon: '🍳', label: 'Ev yemeği yapar' });
  return out;
}

// ── Trait pill — uses direct label map, never shows raw keys ─────────────────
function TraitPill({ label, language }: { label: string; language: string }) {
  // Normalize: strip leading underscore/spaces, lower, snake_case
  const cleaned    = label.replace(/^_+/, '').trim();
  const normalized = cleaned.toLowerCase().replace(/[\s-]+/g, '_');
  // Resolve i18n key
  const key        = LABEL_TO_KEY[cleaned.toLowerCase()] ?? normalized;
  const icon       = TRAIT_ICON[key] ?? TRAIT_ICON[normalized] ?? '';
  const lang       = (language in TRAIT_LABELS) ? language : 'tr';
  const displayText =
    TRAIT_LABELS[lang]?.[key] ??
    TRAIT_LABELS['tr']?.[key] ??
    TRAIT_LABELS['en']?.[key] ??
    cleaned.replace(/_/g, ' ');  // last resort: snake → readable

  return (
    <View style={st.pill} accessibilityLabel={displayText}>
      {icon ? <Text style={st.pillIcon}>{icon}</Text> : null}
      <Text style={st.pillTxt}>{displayText}</Text>
    </View>
  );
}

// ── Stat column ───────────────────────────────────────────────────────────────
function StatCol({ value, label }: { value: string; label: string }) {
  return (
    <View style={st.statCol}>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }: Props) {
  const { t, language }  = useTranslation();
  const quizAnswers      = useAppStore(s => s.quizAnswers);
  const quizCity         = useAppStore(s => s.quizCity);
  const isVerified       = useAppStore(s => s.isVerified);
  const setVerified      = useAppStore(s => s.setVerified);
  const storeProfile     = useAppStore(s => s.profile);
  const setProfile       = useAppStore(s => s.setProfile);
  const setQuizCompleted = useAppStore(s => s.setQuizCompleted);
  const activeMatches    = useAppStore(s => s.activeMatches);
  const userType         = useAppStore(s => s.userType);
  const isLandlord       = userType === 'landlord';

  const [loading,  setLoading]  = useState(!storeProfile);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (storeProfile) return;
      setLoading(true);
      setFetchErr(null);
      try {
        const profile = await profileService.getProfile();
        setProfile(profile);
        if (profile.quizCompleted || (profile.traits && profile.traits.length > 0)) {
          setQuizCompleted(true);
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.response?.data?.error || t('profile.loading');
        setFetchErr(Array.isArray(msg) ? msg[0] : msg);
      } finally {
        setLoading(false);
      }
    };
    const loadVerification = async () => {
      try {
        const status = await verificationService.getVerificationStatus();
        setVerified(status.isVerified === true || (status as any).verified === true);
      } catch {
        setVerified(false);
      }
    };
    loadProfile();
    loadVerification();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Display values
  const displayName  = storeProfile?.name ?? 'Kullanıcı';
  const displayAge   = storeProfile?.age ?? null;
  const displayCity  = storeProfile?.city ?? quizCity ?? null;
  const displayBio   = storeProfile?.bio ?? null;
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUri    = storeProfile?.avatarUrl ?? storeProfile?.avatar_url ?? null;

  const traitItems =
    storeProfile?.traits && storeProfile.traits.length > 0
      ? storeProfile.traits.map(label => ({
          icon: BACKEND_TRAIT_MAP[label.toLowerCase().replace(/[- ]/g, '_')]?.icon ?? '',
          label,
        }))
      : deriveTraitsFromAnswers(quizAnswers);

  const traitCount = traitItems.length;
  const matchCount = activeMatches.length;

  const locationLine = [displayCity, displayAge ? String(displayAge) : null]
    .filter(Boolean).join(' · ') || '—';

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.turq} />
          <Text style={st.loadingTxt}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity
          style={st.hBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel={t('common.goBack')}
        >
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>{t('profile.title')}</Text>
        <TouchableOpacity
          style={st.hBtn}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.7}
          accessibilityLabel={t('profile.editProfile')}
        >
          <Text style={st.hBtnTxt}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* Error banner */}
        {fetchErr && (
          <View style={st.errBanner}>
            <Text style={st.errBannerTxt}>⚠ {fetchErr}</Text>
          </View>
        )}

        {/* ── Hero ── */}
        <View style={st.hero}>

          {/* Single radial halo behind avatar */}
          <View pointerEvents="none" style={st.haloWrap}>
            <View style={st.halo} />
          </View>

          {/* Avatar: accent ring → white ring → avatar */}
          <View style={st.avatarWrap}>
            <View style={st.avatarAccent}>
              <View style={st.avatarRing}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={st.avatar} resizeMode="cover" />
                ) : (
                  <View style={st.avatar}>
                    <Text style={st.avatarTxt}>{avatarLetter}</Text>
                  </View>
                )}
              </View>
            </View>
            {isVerified && (
              <View style={st.verifiedDot} accessibilityLabel={t('settings.verified')}>
                <Text style={st.verifiedDotTxt}>✓</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={st.name}>{displayName}</Text>

          {/* City · Age */}
          <Text style={st.sub}>{locationLine}</Text>

          {/* University chip */}
          {!isLandlord && storeProfile?.university && (
            <View style={[st.chip, { marginTop: 8 }]}>
              <Text style={st.chipTxt}>🎓 {storeProfile.university}</Text>
            </View>
          )}

          {/* Landlord role badge */}
          {isLandlord && (
            <View style={[st.chip, { marginTop: 8 }]}>
              <Text style={st.chipTxt}>🏠 {t('auth.landlord')}</Text>
            </View>
          )}

          {/* Bio */}
          {displayBio ? <Text style={st.bio}>{displayBio}</Text> : null}

          {/* Quiz ✓ · trait count — two chips */}
          <View style={st.chipRow}>
            <View style={[st.chip, st.chipTeal]}>
              <Text style={[st.chipTxt, st.chipTealTxt]}>✿ {t('profile.quizDone')}</Text>
            </View>
            <View style={st.chipSep} />
            <View style={[st.chip, st.chipTeal]}>
              <Text style={[st.chipTxt, st.chipTealTxt]}>{t('profile.features').replace('{0}', String(traitCount))}</Text>
            </View>
          </View>

          {/* Verify / Verified CTA */}
          {!isLandlord && (
            isVerified ? (
              <View style={st.verifiedBanner}>
                <Text style={st.verifiedBannerTxt}>✓ {t('settings.verifiedStudent')}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={st.verifyBtn}
                onPress={() => navigation.navigate('Verification')}
                activeOpacity={0.8}
                accessibilityLabel={t('settings.verifyStudent')}
              >
                <Text style={st.verifyBtnTxt}>🎓 {t('settings.verifyStudent')}</Text>
                <Text style={st.verifyBtnArrow}>→</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* ── Stats row ── */}
        <View style={st.statsRow}>
          <StatCol value={matchCount > 0 ? String(matchCount) : '—'} label="MATCHES" />
          <View style={st.statDiv} />
          <StatCol value="—" label="AVG FIT" />
          <View style={st.statDiv} />
          <StatCol value="—" label="RATING" />
        </View>

        {/* ── Traits section ── */}
        <View style={st.section}>
          <Text style={st.eyebrow}>{t('profile.traitsLabel')}</Text>
          <Text style={st.sectionTitle}>{t('profile.traits')}</Text>
          <Text style={st.sectionSub}>{t('profile.traitsSub')}</Text>
        </View>

        <View style={st.pillRow}>
          {traitItems.length > 0
            ? traitItems.map((item, idx) => (
                <TraitPill key={idx} label={item.label} language={language} />
              ))
            : (
              <View style={st.emptyCard}>
                <Text style={st.emptyTxt}>{t('profile.noTraits')}</Text>
              </View>
            )
          }
        </View>

        {/* ── Footer CTA ── */}
        <View style={st.footer}>
          <LinearGradient
            colors={['#00CFC8', '#2BD9D2', '#FF9ACD']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={st.ctaGrad}
          >
            <TouchableOpacity
              style={st.cta}
              onPress={() => navigation.replace(isLandlord ? 'LandlordTabs' : 'MainTabs')}
              activeOpacity={0.88}
              accessibilityLabel={isLandlord ? t('profile.myListings') : t('profile.seeMatches')}
            >
              <Text style={st.ctaTxt}>
                {isLandlord ? t('profile.myListings') : t('profile.seeMatches')}
              </Text>
              <Text style={st.ctaArrow}>→</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            style={st.editBtn}
            onPress={() => navigation.navigate('ProfileEdit')}
            activeOpacity={0.7}
          >
            <Text style={st.editTxt}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  scroll:      { paddingBottom: 48 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt:  { color: C.mute, fontSize: 14 },

  // ── Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn:    { width: 44, height: 44, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  hBtnTxt: { color: C.ink, fontSize: 16 },
  hTitle:  { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  // ── Error
  errBanner:    { marginHorizontal: 18, marginTop: 10, backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 12, borderWidth: 1, borderColor: '#EF444433', paddingVertical: 10, paddingHorizontal: 14 },
  errBannerTxt: { color: C.error, fontSize: 12, fontWeight: '500' },

  // ── Hero
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24 },

  // Halo container: absolute, spans full width, centers the glow circle
  haloWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  halo:     { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,207,200,0.10)' },

  // Avatar rings: turquoise accent → white ring → avatar
  avatarWrap:   { position: 'relative', marginBottom: 16 },
  avatarAccent: { width: 107, height: 107, borderRadius: 999, borderWidth: 1.5, borderColor: C.turq, alignItems: 'center', justifyContent: 'center' },
  avatarRing:   { width: 102, height: 102, borderRadius: 999, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  avatar:       { width: 96, height: 96, borderRadius: 999, backgroundColor: C.turq, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:    { color: '#fff', fontSize: 38, fontWeight: '800' },

  // Verified tick — bottom-right of avatarWrap
  verifiedDot:    { position: 'absolute', bottom: 1, right: 1, width: 24, height: 24, borderRadius: 999, backgroundColor: C.green, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  verifiedDotTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  name: { color: C.ink, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sub:  { color: C.mute, fontSize: 13, fontWeight: '500', marginTop: 4 },
  bio:  { color: C.soft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 12 },

  // Chips
  chipRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  chip:        { backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingVertical: 6, paddingHorizontal: 14 },
  chipTeal:    { backgroundColor: C.turq50, borderColor: `${C.turq}55` },
  chipTxt:     { color: C.soft, fontSize: 12, fontWeight: '600' },
  chipTealTxt: { color: C.turqTx },
  chipSep:     { width: 4, height: 4, borderRadius: 2, backgroundColor: C.mute },

  // Verify ghost button
  verifyBtn:      { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: '#fff', borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingVertical: 13, paddingHorizontal: 20, minWidth: 260, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  verifyBtnTxt:   { color: C.ink, fontSize: 13, fontWeight: '600', flex: 1 },
  verifyBtnArrow: { color: C.mute, fontSize: 16, marginLeft: 8 },

  // Verified banner (green, shown when verified)
  verifiedBanner:    { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: C.greenBg, borderRadius: 999, borderWidth: 1, borderColor: '#10B98155', paddingVertical: 10, paddingHorizontal: 20 },
  verifiedBannerTxt: { color: C.greenTx, fontSize: 13, fontWeight: '700' },

  // ── Stats row
  statsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginTop: 4, backgroundColor: C.bgSoft, borderRadius: 16, borderWidth: 1, borderColor: C.line, paddingVertical: 18 },
  statCol:  { flex: 1, alignItems: 'center' },
  statValue:{ color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLabel:{ color: C.mute, fontSize: 9, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 },
  statDiv:  { width: 1, height: 32, backgroundColor: C.line },

  // ── Section header
  section:      { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 12 },
  eyebrow:      { color: C.mute, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  sectionTitle: { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionSub:   { color: C.soft, fontSize: 13, lineHeight: 20, marginTop: 4 },

  // ── Trait pills — clean white, ink border
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, gap: 8 },
  pill:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingVertical: 8, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  pillIcon:{ fontSize: 14 },
  pillTxt: { fontSize: 13, fontWeight: '500', color: C.ink },

  emptyCard: { width: '100%', padding: 24, alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: 18, borderWidth: 1, borderColor: C.line },
  emptyTxt:  { color: C.mute, fontSize: 14 },

  // ── Footer CTA
  footer:  { paddingHorizontal: 18, paddingTop: 28, gap: 14 },
  ctaGrad: {
    borderRadius: 999,
    shadowColor: C.turq,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 8,
  },
  cta:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: 10, borderRadius: 999 },
  ctaTxt:   { color: '#fff', fontSize: 15, fontWeight: '600' },
  ctaArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },
  editBtn:  { alignItems: 'center', paddingVertical: 10 },
  editTxt:  { color: C.mute, fontSize: 13, fontWeight: '500' },
});
