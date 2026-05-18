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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { profileService } from '../api/ProfileService';
import { verificationService } from '../api/VerificationService';

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
  brandA:  '#00CFC8',
  brandB:  '#FF9ACD',
  tealBg:  '#E6FBFA',
  tealTx:  '#00A8A2',
  pinkBg:  '#FFF0F7',
  pinkTx:  '#F06EB1',
  darkBg:  '#1A1C22',
  errorBg: 'rgba(239,68,68,0.08)',
  error:   '#EF4444',
};

// ── Trait türleri ─────────────────────────────────────────────────────────────
type TraitColor = 'teal' | 'pink' | 'dark';
interface Trait { icon: string; label: string; color: TraitColor }

// Backend'den gelen trait string'lerini görsel Trait nesnesine çevirir
const BACKEND_TRAIT_MAP: Record<string, Trait> = {
  gece_kusu:     { icon: '🌙', label: 'Gece kuşu',      color: 'pink' },
  erken_kalkan:  { icon: '☀️',  label: 'Erken kalkan',    color: 'teal' },
  duzenli:       { icon: '✨',  label: 'Düzenli',         color: 'teal' },
  rahat:         { icon: '😌', label: 'Rahat',            color: 'dark' },
  sosyal:        { icon: '🤝', label: 'Sosyal',           color: 'pink' },
  icedonuk:      { icon: '🧘', label: 'İçe dönük',        color: 'teal' },
  remote:        { icon: '🏠', label: 'Remote',           color: 'teal' },
  hybrid:        { icon: '💻', label: 'Hybrid',           color: 'dark' },
  gece_calisir:  { icon: '🦉', label: 'Gece çalışır',    color: 'pink' },
  evcil_hayvan:  { icon: '🐾', label: 'Evcil hayvanlı',  color: 'pink' },
  hayvan_sever:  { icon: '🐾', label: 'Hayvan sever',     color: 'pink' },
  sigara_icmez:  { icon: '🚭', label: 'Sigara içmez',    color: 'teal' },
  sigara:        { icon: '🚬', label: 'Sigara içer',      color: 'dark' },
  alkol_yok:     { icon: '🫖', label: 'Alkol almaz',      color: 'teal' },
  sosyal_ici:    { icon: '🥂', label: 'Sosyal içici',     color: 'pink' },
  nadir_ici:     { icon: '🍷', label: 'Nadir içer',       color: 'dark' },
  ev_yemegi:     { icon: '🍳', label: 'Ev yemeği yapar', color: 'teal' },
};

/** Backend trait array'inden Trait[] üretir; bilinmeyen key'leri genel gösterimle ekler */
function mapBackendTraits(keys: string[]): Trait[] {
  return keys.map(k => {
    const lower = k.toLowerCase().replace(/[- ]/g, '_');
    return BACKEND_TRAIT_MAP[lower] ?? { icon: '✦', label: k, color: 'dark' as TraitColor };
  });
}

/** Quiz cevaplarından lokal trait çıkarımı — backend trait yoksa fallback */
function deriveTraitsFromAnswers(a: (number | null)[]): Trait[] {
  const get = (i: number) => a[i] ?? -1;
  const traits: Trait[] = [];

  if (get(0) === 1 || get(0) === 2)         traits.push({ icon: '🌙', label: 'Gece kuşu',      color: 'pink' });
  else if (get(0) === 0)                     traits.push({ icon: '☀️',  label: 'Erken kalkan',    color: 'teal' });
  if (get(3) === 0 || get(3) === 1)         traits.push({ icon: '✨',  label: 'Düzenli',         color: 'teal' });
  else if (get(3) === 3)                    traits.push({ icon: '😌', label: 'Rahat',            color: 'dark' });
  if (get(6) === 0 || get(6) === 1)        traits.push({ icon: '🤝', label: 'Sosyal',           color: 'pink' });
  else if (get(6) === 2 || get(6) === 3)   traits.push({ icon: '🧘', label: 'İçe dönük',        color: 'teal' });
  if (get(9) === 0)                         traits.push({ icon: '🏠', label: 'Remote',           color: 'teal' });
  else if (get(9) === 3)                    traits.push({ icon: '💻', label: 'Hybrid',           color: 'dark' });
  if (get(11) === 2 || get(11) === 3)      traits.push({ icon: '🦉', label: 'Gece çalışır',     color: 'pink' });
  if (get(12) === 0)                        traits.push({ icon: '🐾', label: 'Evcil hayvanlı',  color: 'pink' });
  if (get(13) === 1)                        traits.push({ icon: '🚭', label: 'Sigara içmez',    color: 'teal' });
  else if (get(13) === 0)                   traits.push({ icon: '🚬', label: 'Sigara içer',      color: 'dark' });
  if (get(14) === 3)                        traits.push({ icon: '🫖', label: 'Alkol almaz',      color: 'teal' });
  else if (get(14) === 1)                   traits.push({ icon: '🥂', label: 'Sosyal içici',     color: 'pink' });
  if (get(15) === 0 || get(15) === 1)      traits.push({ icon: '🍳', label: 'Ev yemeği yapar', color: 'teal' });

  return traits;
}

// ── Trait kartı ───────────────────────────────────────────────────────────────
function TraitCard({ trait }: { trait: Trait }) {
  const bgMap:     Record<TraitColor, string> = { teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4' };
  const txMap:     Record<TraitColor, string> = { teal: '#fff',    pink: '#fff',    dark: '#fff'    };
  const borderMap: Record<TraitColor, string> = {
    teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4',
  };
  return (
    <View style={[st.traitCard, {
      backgroundColor: bgMap[trait.color],
      borderColor:     borderMap[trait.color],
    }]}>
      <Text style={st.traitIcon}>{trait.icon}</Text>
      <Text style={[st.traitLabel, { color: txMap[trait.color] }]}>{trait.label}</Text>
    </View>
  );
}

// ── Trait pill (hafif / renkli chip — doğrudan label string alır) ─────────────
function TraitPill({ label }: { label: string }) {
  // Label'den icon bul — hem snake_case hem okunabilir string dene
  const normalized = label.toLowerCase().replace(/[- ]/g, '_');
  const mapped = BACKEND_TRAIT_MAP[normalized];
  const icon  = mapped?.icon  ?? '✦';
  const color = mapped?.color ?? ('dark' as TraitColor);

  const bgMap:     Record<TraitColor, string> = { teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4' };
  const txMap:     Record<TraitColor, string> = { teal: '#fff',    pink: '#fff',    dark: '#fff'    };
  const borderMap: Record<TraitColor, string> = {
    teal: '#00BCD4', pink: '#00BCD4', dark: '#00BCD4',
  };

  return (
    <View style={[st.traitPill, { backgroundColor: bgMap[color], borderColor: borderMap[color] }]}>
      <Text style={st.traitPillIcon}>{icon}</Text>
      <Text style={[st.traitPillTxt, { color: txMap[color] }]}>{label}</Text>
    </View>
  );
}

// ── Ana bileşen ────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }: Props) {
  const quizAnswers = useAppStore(s => s.quizAnswers);
  const quizCity    = useAppStore(s => s.quizCity);
  const isVerified  = useAppStore(s => s.isVerified);
  const setVerified  = useAppStore(s => s.setVerified);
  const storeProfile = useAppStore(s => s.profile);
  const setProfile   = useAppStore(s => s.setProfile);
  const userType     = useAppStore(s => s.userType);
  const isLandlord   = userType === 'landlord';

  const [loading,  setLoading]  = useState(!storeProfile); // daha önce fetch'lendiyse skip
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // ── Profile fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      if (storeProfile) return;
      setLoading(true);
      setFetchErr(null);
      try {
        const profile = await profileService.getProfile();
        setProfile(profile);
      } catch (error: any) {
        console.error('Profile load error:', error);
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error   ||
          'Profil yüklenemedi.';
        setFetchErr(Array.isArray(msg) ? msg[0] : msg);
      } finally {
        setLoading(false);
      }
    };

    const loadVerificationStatus = async () => {
      try {
        const status = await verificationService.getVerificationStatus();
        setVerified(status.isVerified === true || (status as any).verified === true);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          console.log('Verify endpoint yok, atlanıyor');
        } else {
          console.error('Verify status error:', error);
        }
        setVerified(false);
      }
    };

    loadProfile();
    loadVerificationStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Görüntülenecek değerler ─────────────────────────────────────────────────
  const displayName       = storeProfile?.name       ?? 'Kullanıcı';
  const displayAge        = storeProfile?.age        ?? null;
  const displayCity       = storeProfile?.city       ?? quizCity ?? null;
  const displayUniversity = storeProfile?.university ?? null;
  const displayBio        = storeProfile?.bio        ?? null;
  const avatarLetter      = displayName.charAt(0).toUpperCase();
  // Backend camelCase veya snake_case avatar URL
  const avatarUri         = storeProfile?.avatarUrl ?? storeProfile?.avatar_url ?? null;

  // Trait string listesi: önce backend (okunabilir etiket veya snake_case),
  // sonra quiz cevaplarından türetilmiş Trait[] → label'a dönüştür
  const traitLabels: string[] =
    storeProfile?.traits && storeProfile.traits.length > 0
      ? storeProfile.traits
      : deriveTraitsFromAnswers(quizAnswers).map(t => t.label);

  // Eski TraitCard bileşeni için — gerekirse hâlâ kullanılabilir
  const traits: Trait[] = mapBackendTraits(traitLabels);

  // ── Loading durumu ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>Profil yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>Senin Profilin</Text>
        {/* Profil Düzenle — sağ üst köşe */}
        <TouchableOpacity
          style={st.hBtn}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.7}
        >
          <Text style={st.hEditTxt}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* ── Hata banner'ı (veri kısmen eksikse göster, engelleme) ── */}
        {fetchErr && (
          <View style={st.errBanner}>
            <Text style={st.errBannerTxt}>⚠ {fetchErr} — yerel veriler gösteriliyor.</Text>
          </View>
        )}

        {/* ── Hero ── */}
        <View style={st.hero}>
          <View style={st.heroBlob1} />
          <View style={st.heroBlob2} />

          {/* Avatar */}
          <View style={st.avatarWrap}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={st.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={st.avatar}>
                <Text style={st.avatarTxt}>{avatarLetter}</Text>
              </View>
            )}
            {isVerified && (
              <View style={st.avatarBadge}>
                <Text style={st.avatarBadgeTxt}>✓</Text>
              </View>
            )}
          </View>

          {/* İsim */}
          <Text style={st.name}>{displayName}</Text>

          {/* Yaş · Şehir */}
          <Text style={st.sub}>
            {[displayAge ? `${displayAge} yaşında` : null, displayCity]
              .filter(Boolean)
              .join(' · ') || 'Profil bilgisi yok'}
          </Text>

          {/* Rol badge */}
          {isLandlord && (
            <View style={[st.infoChip, { backgroundColor: '#FEF9C3', borderColor: '#F59E0B55', marginBottom: 4 }]}>
              <Text style={{ color: '#854D0E', fontSize: 12, fontWeight: '700' }}>🏠 Ev Sahibi</Text>
            </View>
          )}

          {/* Üniversite + doğrulama */}
          <View style={st.infoRow}>
            {!isLandlord && displayUniversity && (
              <View style={st.infoChip}>
                <Text style={st.infoChipTxt}>🎓 {displayUniversity}</Text>
              </View>
            )}
            {!isLandlord && isVerified && (
              <View style={[st.infoChip, st.verifiedChip]}>
                <Text style={st.verifiedChipTxt}>✓ Doğrulanmış Öğrenci</Text>
              </View>
            )}
            {isLandlord && storeProfile?.phone && (
              <View style={st.infoChip}>
                <Text style={st.infoChipTxt}>📞 {storeProfile.phone}</Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {displayBio ? (
            <Text style={st.bio}>{displayBio}</Text>
          ) : null}

          {/* Trait sayısı pill */}
          <View style={st.scorePill}>
            <Text style={st.scoreTxt}>✦ Quiz tamamlandı</Text>
            <View style={st.scoreDot} />
            <Text style={st.scoreTxt}>{traits.length} özellik belirlendi</Text>
          </View>

          {/* Doğrulama butonu — sadece öğrenci */}
          {!isLandlord && !isVerified && (
            <TouchableOpacity
              style={st.verifyBtn}
              onPress={() => navigation.navigate('Verification')}
              activeOpacity={0.85}
            >
              <Text style={st.verifyBtnTxt}>🎓 Öğrenci Kimliğini Doğrula</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Özellikler bölümü ── */}
        <View style={st.section}>
          <Text style={st.sectionEyebrow}>SENİN PROFİLİN</Text>
          <Text style={st.sectionTitle}>Öne çıkan özellikler</Text>
          <Text style={st.sectionSub}>
            Ev arkadaşı adayları bu özelliklere göre eşleştirilecek.
          </Text>
        </View>

        {/* ── Trait pills ── */}
        <View style={st.pillRow}>
          {traitLabels.length > 0
            ? traitLabels.map(label => <TraitPill key={label} label={label} />)
            : (
              <View style={st.emptyCard}>
                <Text style={st.emptyTxt}>Quiz cevapları henüz yok.</Text>
              </View>
            )
          }
        </View>

        {/* ── Footer CTA'lar ── */}
        <View style={st.footer}>
          <TouchableOpacity
            style={st.cta}
            onPress={() => navigation.replace(isLandlord ? 'LandlordTabs' : 'MainTabs')}
            activeOpacity={0.85}
          >
            <Text style={st.ctaTxt}>{isLandlord ? 'İlanlarıma Git' : 'Eşleşmeleri Gör'}</Text>
            <Text style={st.ctaArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={st.editBtn}
            onPress={() => navigation.navigate('ProfileEdit')}
            activeOpacity={0.7}
          >
            <Text style={st.editTxt}>Profili düzenle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  scroll:      { paddingBottom: 40 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt:  { color: C.mute, fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn:     { width: 38, height: 38, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  hBtnTxt:  { color: C.ink, fontSize: 17 },
  hEditTxt: { fontSize: 17 },
  hTitle:   { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  errBanner: {
    marginHorizontal: 18, marginTop: 10,
    backgroundColor: C.errorBg, borderRadius: 12,
    borderWidth: 1, borderColor: C.error + '33',
    paddingVertical: 10, paddingHorizontal: 14,
  },
  errBannerTxt: { color: C.error, fontSize: 12, fontWeight: '500', lineHeight: 18 },

  hero: {
    alignItems: 'center', paddingTop: 28, paddingBottom: 24,
    paddingHorizontal: 24, overflow: 'hidden', position: 'relative',
  },
  heroBlob1: { position: 'absolute', width: 260, height: 260, borderRadius: 999, backgroundColor: C.brandA, top: -100, left: -80, opacity: 0.12 },
  heroBlob2: { position: 'absolute', width: 260, height: 260, borderRadius: 999, backgroundColor: C.brandB, top: -80, right: -80, opacity: 0.12 },

  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar:     { width: 88, height: 88, borderRadius: 999, backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center', shadowColor: C.brandA, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  avatarTxt:  { color: '#fff', fontSize: 36, fontWeight: '800' },
  avatarBadge:    { position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: 999, backgroundColor: C.brandA, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },

  name: { color: C.ink,  fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  sub:  { color: C.soft, fontSize: 13, marginTop: 3 },

  infoRow:        { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  infoChip:       { backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingVertical: 5, paddingHorizontal: 12 },
  infoChipTxt:    { color: C.soft, fontSize: 12, fontWeight: '500' },
  verifiedChip:   { backgroundColor: '#ECFDF5', borderColor: '#10B98155' },
  verifiedChipTxt:{ color: '#059669', fontSize: 12, fontWeight: '700' },

  bio: { color: C.soft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12, paddingHorizontal: 8 },

  scorePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, marginTop: 14 },
  scoreDot:  { width: 4, height: 4, borderRadius: 999, backgroundColor: C.tealTx },
  scoreTxt:  { color: C.tealTx, fontSize: 12, fontWeight: '600' },

  verifyBtn:    { marginTop: 14, backgroundColor: '#FFF7E6', borderRadius: 999, borderWidth: 1.5, borderColor: '#F59E0B', paddingVertical: 11, paddingHorizontal: 22 },
  verifyBtnTxt: { color: '#B45309', fontSize: 13, fontWeight: '700' },

  section:         { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  sectionEyebrow:  { color: C.mute, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  sectionTitle:    { color: C.ink,  fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionSub:      { color: C.soft, fontSize: 13, lineHeight: 20, marginTop: 4 },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  traitCard: { width: '47%', flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  traitIcon:  { fontSize: 20 },
  traitLabel: { fontSize: 13, fontWeight: '600', flex: 1 },

  // Pill variant (light colored chips)
  pillRow:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, gap: 8 },
  traitPill:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, borderWidth: 1.5, paddingVertical: 8, paddingHorizontal: 14 },
  traitPillIcon: { fontSize: 14 },
  traitPillTxt:  { fontSize: 13, fontWeight: '600' },

  emptyCard:  { width: '100%', padding: 24, alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: 18, borderWidth: 1, borderColor: C.line },
  emptyTxt:   { color: C.mute, fontSize: 14 },

  footer:    { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  cta:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 18, shadowColor: C.brandA, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 20, elevation: 8 },
  ctaTxt:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaArrow:  { color: '#fff', fontSize: 18, fontWeight: '700' },
  editBtn:   { alignItems: 'center', paddingVertical: 10 },
  editTxt:   { color: C.mute, fontSize: 13, fontWeight: '500' },
});
