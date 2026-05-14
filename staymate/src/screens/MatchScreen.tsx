import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  Animated, PanResponder, Dimensions, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../../App';
import { useAppStore, isFiltersActive } from '../store';
import { scheduleMatchNotification } from '../services/NotificationService';
import { matchService, type ApiSuggestion } from '../api/MatchService';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.30;

type MatchNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Match'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Props = { navigation: MatchNavProp };

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', brandB: '#FF9ACD',
  tealBg: '#E6FBFA', tealTx: '#00A8A2',
  pinkBg: '#FFF0F7', pinkTx: '#F06EB1',
};

type Compat = { sleep: number; clean: number; social: number; work: number; lifestyle: number };

/** UI'da kullanılan normalize edilmiş kullanıcı tipi */
type MatchUser = {
  id: string; name: string; age: number; initial: string; avatarColor: string;
  city: string; uni: string; bio: string; traits: string[]; match: number;
  budget: number; gender: 'Kadın' | 'Erkek';
  smokes: boolean; alcohol: 'never' | 'social' | 'regular';
  hasPet: boolean; diet: 'normal' | 'vegan' | 'vegetarian' | 'halal';
  sleepPattern: 'night' | 'mid' | 'early';
  cleanlinessRating: number;
  verified: boolean;
  compat: Compat;
};

// ── Avatar renk paleti ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];
function pickAvatarColor(id: string): string {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/** Backend ApiSuggestion → UI MatchUser */
function mapSuggestion(raw: ApiSuggestion): MatchUser {
  const score = raw.compatibilityScore ?? raw.match ?? 80;
  const compatScore = (n?: number) => n ?? score;
  return {
    id:               raw.id,
    name:             raw.name ?? 'Kullanıcı',
    age:              raw.age ?? 22,
    initial:          (raw.name ?? 'K').charAt(0).toUpperCase(),
    avatarColor:      pickAvatarColor(raw.id),
    city:             raw.city ?? '',
    uni:              raw.university ?? '',
    bio:              raw.bio ?? '',
    traits:           (raw.traits ?? []).map(t => `✦ ${t}`),
    match:            score,
    budget:           raw.budget ?? 2000,
    gender:           raw.gender === 'Erkek' ? 'Erkek' : 'Kadın',
    smokes:           raw.smokes ?? false,
    alcohol:          raw.alcohol ?? 'social',
    hasPet:           raw.hasPet ?? false,
    diet:             raw.diet ?? 'normal',
    sleepPattern:     raw.sleepPattern ?? 'mid',
    cleanlinessRating: raw.cleanlinessRating ?? 3,
    verified:         raw.verified ?? false,
    compat: {
      sleep:     compatScore(raw.compat?.sleep),
      clean:     compatScore(raw.compat?.clean),
      social:    compatScore(raw.compat?.social),
      work:      compatScore(raw.compat?.work),
      lifestyle: compatScore(raw.compat?.lifestyle),
    },
  };
}

// ── Hardcoded fallback (API erişilemezse) ─────────────────────────────────────
const FALLBACK_USERS: MatchUser[] = [
  { id: 'f1', name: 'Zofia', age: 24, initial: 'Z', avatarColor: '#00CFC8', city: 'Kraków', uni: 'Uniwersytet Jagielloński', budget: 1800, match: 96, gender: 'Kadın', smokes: false, alcohol: 'social', hasPet: false, diet: 'normal', sleepPattern: 'night', cleanlinessRating: 5, verified: true, bio: 'Sabah yogası, bitki annesi ve pour-over kahve ritüelim var.', traits: ['🌙 Gece kuşu', '🌿 Bitki annesi', '🚭 Sigara içmez'], compat: { sleep: 90, clean: 98, social: 88, work: 94, lifestyle: 96 } },
  { id: 'f2', name: 'Kasia', age: 27, initial: 'K', avatarColor: '#FF9ACD', city: 'Warszawa', uni: 'Politechnika Warszawska', budget: 2400, match: 92, gender: 'Kadın', smokes: false, alcohol: 'social', hasPet: true, diet: 'normal', sleepPattern: 'early', cleanlinessRating: 4, verified: true, bio: 'Stüdyoda müzik yapıyorum. Hafta sonu kahvaltıları büyük tutkum.', traits: ['🎵 Müzisyen', '☀️ Erken kalkan', '🤝 Sosyal'], compat: { sleep: 88, clean: 90, social: 97, work: 86, lifestyle: 92 } },
  { id: 'f3', name: 'Marta', age: 22, initial: 'M', avatarColor: '#33D9D3', city: 'Wrocław', uni: 'Politechnika Wrocławska', budget: 1600, match: 91, gender: 'Kadın', smokes: false, alcohol: 'never', hasPet: false, diet: 'vegetarian', sleepPattern: 'mid', cleanlinessRating: 5, verified: true, bio: 'Hafta içi sessiz, hafta sonu keyifli. Matcha içerim, kitap okurum.', traits: ['🧘 İçe dönük', '✨ Düzenli', '🌱 Vejeteryan'], compat: { sleep: 94, clean: 95, social: 80, work: 89, lifestyle: 88 } },
  { id: 'f4', name: 'Ola', age: 29, initial: 'O', avatarColor: '#FFA8D4', city: 'Poznań', uni: 'Politechnika Poznańska', budget: 2200, match: 89, gender: 'Kadın', smokes: false, alcohol: 'social', hasPet: false, diet: 'normal', sleepPattern: 'mid', cleanlinessRating: 5, verified: false, bio: 'Tasarımcı, remote çalışıyorum. Minimal yaşam, temiz mutfak.', traits: ['💻 Remote', '✨ Düzenli', '🍳 Ev yemeği'], compat: { sleep: 85, clean: 93, social: 82, work: 96, lifestyle: 88 } },
  { id: 'f5', name: 'Hania', age: 25, initial: 'H', avatarColor: '#C9A8FF', city: 'Gdańsk', uni: 'Politechnika Gdańska', budget: 1900, match: 88, gender: 'Kadın', smokes: false, alcohol: 'never', hasPet: true, diet: 'vegan', sleepPattern: 'night', cleanlinessRating: 3, verified: false, bio: 'Geceleri okur, sabah sessiz ister. Kedi sahibi, bitki koleksiyonu.', traits: ['🌙 Gece kuşu', '🐾 Kedi sahibi', '🌱 Vegan'], compat: { sleep: 91, clean: 87, social: 78, work: 85, lifestyle: 93 } },
];

const COMPAT_LABELS: { key: keyof Compat; label: string }[] = [
  { key: 'sleep', label: 'Uyku düzeni' }, { key: 'clean', label: 'Temizlik' },
  { key: 'social', label: 'Sosyallik' }, { key: 'work', label: 'Çalışma' },
  { key: 'lifestyle', label: 'Yaşam tarzı' },
];

const DIET_MAP: Record<string, MatchUser['diet']> = {
  Vegan: 'vegan', Vejeteryan: 'vegetarian', Helal: 'halal', Normal: 'normal',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MatchScreen({ navigation }: Props) {
  const filters         = useAppStore(s => s.filters);
  const setMatches      = useAppStore(s => s.setMatches);
  const filteredMatches = useAppStore(s => s.filteredMatches); // API-filtered results

  // ── Suggestion fetch (all users, no filter) ────────────────────────────────
  const [allUsers,      setAllUsers]      = useState<MatchUser[]>([]);
  const [loadingUsers,  setLoadingUsers]  = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    matchService
      .getSuggestions()
      .then(raw => {
        if (cancelled) return;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapSuggestion);
          setAllUsers(mapped);
          setMatches(raw);
          setUsingFallback(false);
        } else {
          setAllUsers(FALLBACK_USERS);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) { setAllUsers(FALLBACK_USERS); setUsingFallback(true); }
      })
      .finally(() => { if (!cancelled) setLoadingUsers(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swipe state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser,  setMatchedUser]  = useState<MatchUser | null>(null);
  const [showMatch,    setShowMatch]    = useState(false);
  const [detailUser,   setDetailUser]  = useState<MatchUser | null>(null);

  const position    = useRef(new Animated.ValueXY()).current;
  const matchScale  = useRef(new Animated.Value(0.85)).current;
  const matchAlpha  = useRef(new Animated.Value(0)).current;
  const detailSlide = useRef(new Animated.Value(H)).current;
  const detailAlpha = useRef(new Animated.Value(0)).current;

  // ── User list: API-filtered takes priority, else client-side filter ─────────
  const SLEEP_MAP: Record<string, MatchUser['sleepPattern']> = {
    'Gece kuşu': 'night', Orta: 'mid', Erken: 'early',
  };

  const filteredUsers = useMemo(() => {
    // API'dan filtreli sonuç varsa doğrudan kullan
    if (filteredMatches !== null) {
      return filteredMatches.map(mapSuggestion);
    }
    // Yoksa client-side filtreleme uygula
    return allUsers.filter(u => {
      if (filters.city && u.city !== filters.city) return false;
      if (u.budget < filters.budgetMin || u.budget > filters.budgetMax) return false;
      if (u.age < filters.ageMin || u.age > filters.ageMax) return false;
      if (filters.gender !== 'Fark etmez' && u.gender !== filters.gender) return false;
      if (filters.sleepPattern !== 'Fark etmez' && u.sleepPattern !== SLEEP_MAP[filters.sleepPattern]) return false;
      if (filters.cleanlinessMin > 0 && u.cleanlinessRating < filters.cleanlinessMin) return false;
      if (filters.smoking === 'İçer'  && !u.smokes) return false;
      if (filters.smoking === 'İçmez' &&  u.smokes) return false;
      if (filters.alcohol === 'İçer'  && u.alcohol === 'never') return false;
      if (filters.alcohol === 'İçmez' && u.alcohol !== 'never') return false;
      if (filters.pet === 'Var' && !u.hasPet) return false;
      if (filters.pet === 'Yok' &&  u.hasPet) return false;
      if (filters.diet !== 'Fark etmez' && u.diet !== DIET_MAP[filters.diet]) return false;
      return true;
    });
  }, [allUsers, filters, filteredMatches]);

  const filteredUsersRef = useRef(filteredUsers);
  useEffect(() => { filteredUsersRef.current = filteredUsers; }, [filteredUsers]);

  const filterActive = isFiltersActive(filters);

  // ── Filter banner ──────────────────────────────────────────────────────────
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerY     = useRef(new Animated.Value(-52)).current;
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!filterActive) { setBannerVisible(false); return; }
    setBannerVisible(true);
    Animated.spring(bannerY, { toValue: 0, friction: 7, useNativeDriver: true }).start();
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => {
      Animated.timing(bannerY, { toValue: -52, duration: 220, useNativeDriver: true }).start(
        () => setBannerVisible(false),
      );
    }, 3800);
    return () => { if (bannerTimer.current) clearTimeout(bannerTimer.current); };
  }, [filteredUsers]);

  const idxRef = useRef(0);
  useEffect(() => {
    setCurrentIndex(0);
    idxRef.current = 0;
    position.setValue({ x: 0, y: 0 });
  }, [filteredUsers]);

  // ── Animations ─────────────────────────────────────────────────────────────
  const resetCard = useCallback(() => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: true }).start();
  }, [position]);

  const openMatchModal = () => {
    setShowMatch(true);
    Animated.parallel([
      Animated.spring(matchScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(matchAlpha, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeMatchModal = () => {
    Animated.parallel([
      Animated.timing(matchScale, { toValue: 0.9, duration: 160, useNativeDriver: true }),
      Animated.timing(matchAlpha, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => { setShowMatch(false); matchScale.setValue(0.85); });
  };

  // ── Swipe — API entegrasyon noktası ────────────────────────────────────────
  const swipeCard = useCallback((dir: 'right' | 'left') => {
    const toX = dir === 'right' ? W + 120 : -(W + 120);

    Animated.timing(position, {
      toValue: { x: toX, y: 15 }, duration: 260, useNativeDriver: true,
    }).start(async () => {
      // 1. Kart sıfırla ve indeksi hemen güncelle (UX engellenmesin)
      position.setValue({ x: 0, y: 0 });
      const user = filteredUsersRef.current[idxRef.current];
      idxRef.current += 1;
      setCurrentIndex(i => i + 1);

      if (!user) return;

      if (dir === 'right') {
        // 2. Beğen — API sonucuna göre modal göster
        try {
          const res = await matchService.likeMatch(user.id);
          if (res.matched) {
            setMatchedUser(user);
            openMatchModal();
            const { notificationPreferences } = useAppStore.getState();
            if (notificationPreferences.matches) scheduleMatchNotification(user.name);
          }
        } catch {
          // API hatası → küçük bir ihtimalle göster (offline fallback)
          if (Math.random() > 0.6) {
            setMatchedUser(user);
            openMatchModal();
          }
        }
      } else {
        // 3. Geç — fire-and-forget
        matchService.passMatch(user.id).catch(() => {});
      }
    });
  }, [position]);

  const swipeRef = useRef(swipeCard);
  const resetRef = useRef(resetCard);
  useEffect(() => { swipeRef.current = swipeCard; }, [swipeCard]);
  useEffect(() => { resetRef.current = resetCard; }, [resetCard]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => { position.setValue({ x: g.dx, y: g.dy * 0.2 }); },
      onPanResponderRelease: (_, g) => {
        if      (g.dx >  SWIPE_THRESHOLD) swipeRef.current('right');
        else if (g.dx < -SWIPE_THRESHOLD) swipeRef.current('left');
        else resetRef.current();
      },
    })
  ).current;

  // ── Detail bottom sheet ────────────────────────────────────────────────────
  const openDetail = (user: MatchUser) => {
    setDetailUser(user);
    Animated.parallel([
      Animated.spring(detailSlide, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(detailAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  const closeDetail = () => {
    Animated.parallel([
      Animated.timing(detailSlide, { toValue: H, duration: 280, useNativeDriver: true }),
      Animated.timing(detailAlpha, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => { setDetailUser(null); detailSlide.setValue(H); });
  };
  const detailSwipe = (dir: 'right' | 'left') => {
    closeDetail();
    setTimeout(() => swipeCard(dir), 100);
  };

  // ── Interpolations ─────────────────────────────────────────────────────────
  const rotate = position.x.interpolate({
    inputRange: [-W / 2, 0, W / 2], outputRange: ['-10deg', '0deg', '10deg'], extrapolate: 'clamp',
  });
  const likeOpacity = position.x.interpolate({ inputRange: [0, 55], outputRange: [0, 1], extrapolate: 'clamp' });
  const passOpacity = position.x.interpolate({ inputRange: [-55, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const nextScale   = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [1, 0.94, 1], extrapolate: 'clamp',
  });

  // ── Card stack ─────────────────────────────────────────────────────────────
  const done = currentIndex >= filteredUsers.length;
  const currentUser = !done ? filteredUsers[currentIndex] : null;

  const renderStack = () => {
    if (loadingUsers) {
      return (
        <View style={st.emptyWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={[st.emptySub, { marginTop: 14 }]}>Profiller yükleniyor…</Text>
        </View>
      );
    }

    if (done) {
      return (
        <View style={st.emptyWrap}>
          <Text style={st.emptyIcon}>✿</Text>
          <Text style={st.emptyTitle}>{filterActive ? 'Filtre sonucu yok' : 'Hepsi bu kadar!'}</Text>
          <Text style={st.emptySub}>
            {filterActive ? 'Filtreleri genişletmeyi dene.' : 'Tüm profilleri gördün.\nYeni eşleşmeler yakında.'}
          </Text>
          <TouchableOpacity
            style={st.emptyBtn}
            onPress={() => filterActive ? navigation.navigate('Filter') : navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={st.emptyBtnTxt}>{filterActive ? 'Filtreleri Düzenle' : '← Geri Dön'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const backCard = currentIndex + 1 < filteredUsers.length ? (
      <Animated.View key={filteredUsers[currentIndex + 1].id} style={[st.card, { transform: [{ scale: nextScale }], zIndex: 1 }]}>
        <CardContent user={filteredUsers[currentIndex + 1]} />
      </Animated.View>
    ) : null;

    const frontCard = (
      <Animated.View
        key={filteredUsers[currentIndex].id}
        style={[st.card, { transform: [...position.getTranslateTransform(), { rotate }], zIndex: 2 }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[st.likeLabel, { opacity: likeOpacity }]}>
          <Text style={st.likeLabelTxt}>BEĞENDİM ♥</Text>
        </Animated.View>
        <Animated.View style={[st.passLabel, { opacity: passOpacity }]}>
          <Text style={st.passLabelTxt}>✕ GEÇ</Text>
        </Animated.View>
        <CardContent
          user={filteredUsers[currentIndex]}
          onAIReport={() => navigation.navigate('CompatibilityReport', {
            userId: filteredUsers[currentIndex].id,
            userName: filteredUsers[currentIndex].name,
            userInitial: filteredUsers[currentIndex].initial,
            userAvatarColor: filteredUsers[currentIndex].avatarColor,
            userMatch: filteredUsers[currentIndex].match,
            compat: filteredUsers[currentIndex].compat,
            traits: filteredUsers[currentIndex].traits,
          })}
        />
      </Animated.View>
    );

    return [backCard, frontCard];
  };

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={st.hCenter}>
          <Text style={st.hTitle}>Keşfet</Text>
          {usingFallback && <View style={st.offlineDot} />}
          {!done && !loadingUsers && (
            <>
              <View style={st.hDot} />
              <Text style={st.hSub}>{filteredUsers.length - currentIndex} profil kaldı</Text>
            </>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Mesajlar butonu */}
          <TouchableOpacity
            style={st.hBtn}
            onPress={() => navigation.navigate('ChatList')}
            activeOpacity={0.7}
          >
            <Text style={st.hBtnTxt}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.hBtn} onPress={() => navigation.navigate('Filter')} activeOpacity={0.7}>
            <Text style={st.hBtnTxt}>⊟</Text>
            {filterActive && <View style={st.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter banner */}
      {bannerVisible && (
        <Animated.View style={[st.banner, { transform: [{ translateY: bannerY }] }]}>
          <Text style={st.bannerTxt}>
            {filteredMatches !== null
              ? `✦ API'dan ${filteredUsers.length} profil getirildi`
              : `✓ ${filteredUsers.length} profil filtreye uydu`}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (bannerTimer.current) clearTimeout(bannerTimer.current);
              Animated.timing(bannerY, { toValue: -52, duration: 200, useNativeDriver: true }).start(
                () => setBannerVisible(false),
              );
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={st.bannerClose}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={st.stack}>{renderStack()}</View>

      {/* Actions */}
      {!done && !loadingUsers && (
        <View style={st.actions}>
          <TouchableOpacity style={[st.actionBtn, st.passBtn]} onPress={() => swipeCard('left')} activeOpacity={0.8}>
            <Text style={st.passBtnTxt}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, st.infoBtn]} onPress={() => currentUser && openDetail(currentUser)} activeOpacity={0.8}>
            <Text style={st.infoBtnTxt}>ℹ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, st.likeBtn]} onPress={() => swipeCard('right')} activeOpacity={0.8}>
            <Text style={st.likeBtnTxt}>♥</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Match modal */}
      <Modal visible={showMatch} transparent animationType="none" onRequestClose={closeMatchModal}>
        <View style={st.overlay}>
          <Animated.View style={[st.matchCard, { opacity: matchAlpha, transform: [{ scale: matchScale }] }]}>
            <View style={st.mBlob1} /><View style={st.mBlob2} />
            <Text style={st.mEyebrow}>✦ yeni eşleşme</Text>
            <Text style={st.mTitle}>Eşleştiniz! 🎉</Text>
            {matchedUser && (
              <>
                <View style={[st.mAvatar, { backgroundColor: matchedUser.avatarColor }]}>
                  <Text style={st.mAvatarTxt}>{matchedUser.initial}</Text>
                </View>
                <Text style={st.mName}>{matchedUser.name} ve sen</Text>
                <View style={st.mMatchBadge}><Text style={st.mMatchBadgeTxt}>✦ {matchedUser.match}% uyum</Text></View>
                <Text style={st.mSub}>{matchedUser.name} de seni beğendi! Artık mesajlaşabilirsiniz.</Text>
              </>
            )}
            <TouchableOpacity style={st.mCta} onPress={closeMatchModal} activeOpacity={0.85}>
              <Text style={st.mCtaTxt}>Keşfetmeye Devam Et</Text>
            </TouchableOpacity>
            {/* "Mesaj Gönder" → ChatListScreen */}
            <TouchableOpacity
              style={st.mGhost}
              onPress={() => {
                closeMatchModal();
                navigation.navigate('ChatList');
              }}
              activeOpacity={0.7}
            >
              <Text style={st.mGhostTxt}>Mesaj Gönder →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Detail bottom sheet */}
      <Modal visible={detailUser !== null} transparent animationType="none" onRequestClose={closeDetail}>
        <Animated.View style={[st.detailOverlay, { opacity: detailAlpha }]}>
          <TouchableOpacity style={st.detailBackdrop} onPress={closeDetail} activeOpacity={1} />
          <Animated.View style={[st.detailSheet, { transform: [{ translateY: detailSlide }] }]}>
            {detailUser && <DetailContent user={detailUser} onLike={() => detailSwipe('right')} onPass={() => detailSwipe('left')} />}
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

// ── CardContent ───────────────────────────────────────────────────────────────
function CardContent({ user, onAIReport }: { user: MatchUser; onAIReport?: () => void }) {
  return (
    <View style={st.cardInner}>
      <View style={st.cardTop}>
        <View style={st.avatarWrap}>
          <View style={[st.avatar, { backgroundColor: user.avatarColor }]}>
            <Text style={st.avatarTxt}>{user.initial}</Text>
          </View>
          {user.verified && (
            <View style={st.verifiedBadge}><Text style={st.verifiedBadgeTxt}>✓</Text></View>
          )}
        </View>
        <View style={st.cardTopRight}>
          <View style={st.nameRow}>
            <Text style={st.cardName}>{user.name}</Text>
            <Text style={st.cardAge}>, {user.age}</Text>
          </View>
          <View style={st.matchPill}><Text style={st.matchPillTxt}>✦ {user.match}% uyum</Text></View>
        </View>
      </View>
      <View style={st.divider} />
      <View style={st.metaRow}>
        <Text style={st.metaIcon}>📍</Text>
        <Text style={st.metaTxt}>{user.city || '—'}</Text>
        {user.budget > 0 && <Text style={st.budgetBadge}>{user.budget} ₺/ay</Text>}
      </View>
      {user.uni ? (
        <View style={[st.metaRow, { marginTop: 6 }]}>
          <Text style={st.metaIcon}>🎓</Text>
          <Text style={st.metaTxt}>{user.uni}</Text>
        </View>
      ) : null}
      {user.bio ? <Text style={st.bio}>{user.bio}</Text> : null}
      <View style={st.traits}>
        {user.traits.map((t, i) => (
          <View key={i} style={[st.trait, i % 2 === 0 ? st.traitT : st.traitP]}>
            <Text style={[st.traitTxt, i % 2 === 0 ? st.traitTTxt : st.traitPTxt]}>{t}</Text>
          </View>
        ))}
      </View>
      {onAIReport && (
        <TouchableOpacity style={st.aiReportBtn} onPress={onAIReport} activeOpacity={0.8}>
          <Text style={st.aiReportIcon}>🤖</Text>
          <Text style={st.aiReportTxt}>AI Uyumluluk Raporu</Text>
          <Text style={st.aiReportArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── DetailContent ─────────────────────────────────────────────────────────────
function DetailContent({ user, onLike, onPass }: { user: MatchUser; onLike: () => void; onPass: () => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScroll}>
      <View style={st.detailHandle} />
      <View style={st.detailHero}>
        <View style={[st.detailAvatar, { backgroundColor: user.avatarColor }]}>
          <Text style={st.detailAvatarTxt}>{user.initial}</Text>
        </View>
        <View style={st.detailHeroRight}>
          <View style={st.nameRow}>
            <Text style={st.cardName}>{user.name}</Text>
            <Text style={st.cardAge}>, {user.age}</Text>
          </View>
          {user.city ? <Text style={st.detailCity}>📍 {user.city}</Text> : null}
          <View style={st.matchPill}><Text style={st.matchPillTxt}>✦ {user.match}% uyum</Text></View>
        </View>
      </View>
      <View style={st.compatCard}>
        <Text style={st.compatTitle}>Uyumluluk Detayı</Text>
        {COMPAT_LABELS.map(({ key, label }) => {
          const pct = user.compat[key];
          return (
            <View key={key} style={st.compatRow}>
              <View style={st.compatLabelRow}>
                <Text style={st.compatLabel}>{label}</Text>
                <Text style={st.compatPct}>{pct}%</Text>
              </View>
              <View style={st.compatBarBg}>
                <View style={[st.compatBarFill, { width: `${pct}%` as any }, pct >= 85 ? st.fillTeal : st.fillPink]} />
              </View>
            </View>
          );
        })}
      </View>
      {user.bio ? (
        <View style={st.detailBioCard}>
          <Text style={st.detailBioLabel}>Hakkında</Text>
          <Text style={st.detailBio}>{user.bio}</Text>
        </View>
      ) : null}
      <View style={st.detailTraitsWrap}>
        {user.traits.map((t, i) => (
          <View key={i} style={[st.trait, i % 2 === 0 ? st.traitT : st.traitP]}>
            <Text style={[st.traitTxt, i % 2 === 0 ? st.traitTTxt : st.traitPTxt]}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={st.detailActions}>
        <TouchableOpacity style={[st.detailActionBtn, st.detailPassBtn]} onPress={onPass} activeOpacity={0.8}>
          <Text style={st.detailPassTxt}>✕ Geç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.detailActionBtn, st.detailLikeBtn]} onPress={onLike} activeOpacity={0.8}>
          <Text style={st.detailLikeTxt}>♥ Beğen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  hBtn: { width: 38, height: 38, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  hBtnTxt: { color: C.ink, fontSize: 17 },
  filterDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: C.brandA, borderWidth: 1.5, borderColor: C.bg },
  offlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#F59E0B' },
  hCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  hTitle: { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  hDot:   { width: 4, height: 4, borderRadius: 999, backgroundColor: C.brandA },
  hSub:   { color: C.mute, fontSize: 13 },
  stack:  { flex: 1, marginHorizontal: 16, marginBottom: 4, position: 'relative' },
  card:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderRadius: 28, borderWidth: 1, borderColor: C.line, overflow: 'hidden', shadowColor: '#1F2937', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 20, elevation: 4 },
  likeLabel: { position: 'absolute', top: 26, left: 18, zIndex: 20, backgroundColor: C.tealBg, borderRadius: 12, borderWidth: 2, borderColor: C.brandA, paddingVertical: 7, paddingHorizontal: 14 },
  likeLabelTxt: { color: C.brandA, fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  passLabel: { position: 'absolute', top: 26, right: 18, zIndex: 20, backgroundColor: C.pinkBg, borderRadius: 12, borderWidth: 2, borderColor: C.brandB, paddingVertical: 7, paddingHorizontal: 14 },
  passLabelTxt: { color: C.pinkTx, fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  cardInner: { flex: 1, padding: 22, paddingTop: 28, justifyContent: 'center' },
  cardTop:   { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 68, height: 68, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 4 },
  avatarTxt: { color: '#fff', fontSize: 26, fontWeight: '800' },
  verifiedBadge: { position: 'absolute', bottom: 1, right: 1, width: 20, height: 20, borderRadius: 999, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  verifiedBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800', lineHeight: 12 },
  cardTopRight: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  cardName: { color: C.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  cardAge:  { color: C.soft, fontSize: 20, fontWeight: '600' },
  matchPill: { alignSelf: 'flex-start', marginTop: 7, backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  matchPillTxt: { color: C.tealTx, fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.line, marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaIcon: { fontSize: 14 },
  metaTxt:  { color: C.soft, fontSize: 13, fontWeight: '500', flex: 1 },
  budgetBadge: { color: C.tealTx, fontSize: 12, fontWeight: '700', backgroundColor: C.tealBg, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7 },
  bio: { color: C.ink, fontSize: 14, lineHeight: 22, marginTop: 14, marginBottom: 18 },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trait:     { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  traitT:    { backgroundColor: C.tealBg, borderColor: C.brandA + '44' },
  traitP:    { backgroundColor: C.pinkBg, borderColor: C.brandB + '44' },
  traitTxt:  { fontSize: 12, fontWeight: '600' },
  traitTTxt: { color: C.tealTx },
  traitPTxt: { color: C.pinkTx },
  emptyWrap:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgSoft, borderRadius: 28, borderWidth: 1, borderColor: C.line, padding: 32 },
  emptyIcon:  { fontSize: 44, marginBottom: 14 },
  emptyTitle: { color: C.ink, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptySub:   { color: C.soft, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn:   { backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnTxt:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 12, paddingBottom: 20 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  passBtn: { width: 58, height: 58, backgroundColor: C.pinkBg, borderWidth: 1.5, borderColor: C.brandB + '55', shadowColor: C.brandB, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
  passBtnTxt: { color: C.pinkTx, fontSize: 22, fontWeight: '800' },
  infoBtn: { width: 46, height: 46, backgroundColor: C.bgSoft, borderWidth: 1.5, borderColor: C.line },
  infoBtnTxt: { color: C.mute, fontSize: 18, fontWeight: '700' },
  likeBtn: { width: 68, height: 68, backgroundColor: C.brandA, shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8 },
  likeBtnTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(10,18,30,0.72)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  matchCard: { width: '100%', backgroundColor: C.bg, borderRadius: 32, padding: 30, alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 20 },
  mBlob1: { position: 'absolute', width: 220, height: 220, borderRadius: 999, backgroundColor: C.brandA, top: -90, left: -70, opacity: 0.13 },
  mBlob2: { position: 'absolute', width: 220, height: 220, borderRadius: 999, backgroundColor: C.brandB, top: -70, right: -70, opacity: 0.13 },
  mEyebrow: { color: C.brandA, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 },
  mTitle:   { color: C.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  mAvatar:  { width: 84, height: 84, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  mAvatarTxt: { color: '#fff', fontSize: 34, fontWeight: '800' },
  mName:    { color: C.ink, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  mMatchBadge: { backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 14, marginBottom: 12 },
  mMatchBadgeTxt: { color: C.tealTx, fontSize: 13, fontWeight: '700' },
  mSub: { color: C.soft, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 26, maxWidth: 270 },
  mCta: { width: '100%', backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginBottom: 10, shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.38, shadowRadius: 16, elevation: 6 },
  mCtaTxt:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  mGhost:    { paddingVertical: 10 },
  mGhostTxt: { color: C.brandA, fontSize: 14, fontWeight: '600' },
  detailOverlay:  { flex: 1, backgroundColor: 'rgba(10,18,30,0.5)' },
  detailBackdrop: { flex: 1 },
  detailSheet: { backgroundColor: C.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: H * 0.88, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 20 },
  detailScroll: { paddingBottom: 36 },
  detailHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  detailHero: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 22, marginBottom: 20 },
  detailAvatar: { width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 6 },
  detailAvatarTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
  detailHeroRight: { flex: 1 },
  detailCity:  { color: C.mute, fontSize: 12, marginTop: 3, marginBottom: 6 },
  compatCard:  { marginHorizontal: 18, marginBottom: 16, backgroundColor: C.bgSoft, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 18 },
  compatTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 14 },
  compatRow:   { marginBottom: 12 },
  compatLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  compatLabel: { color: C.soft, fontSize: 12 },
  compatPct:   { color: C.ink, fontSize: 12, fontWeight: '700' },
  compatBarBg:   { height: 5, backgroundColor: C.line, borderRadius: 999, overflow: 'hidden' },
  compatBarFill: { height: '100%', borderRadius: 999 },
  fillTeal: { backgroundColor: C.brandA },
  fillPink: { backgroundColor: C.brandB },
  detailBioCard: { marginHorizontal: 18, marginBottom: 14, backgroundColor: C.bgSoft, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16 },
  detailBioLabel: { color: C.mute, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  detailBio:   { color: C.ink, fontSize: 14, lineHeight: 22 },
  detailTraitsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, marginBottom: 24 },
  detailActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 18 },
  detailActionBtn: { flex: 1, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  detailPassBtn: { backgroundColor: C.pinkBg, borderWidth: 1.5, borderColor: C.brandB + '55' },
  detailPassTxt: { color: C.pinkTx, fontSize: 15, fontWeight: '700' },
  detailLikeBtn: { backgroundColor: C.brandA, shadowColor: C.brandA, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  detailLikeTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  aiReportBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, backgroundColor: C.tealBg, borderRadius: 14, borderWidth: 1, borderColor: C.brandA + '55', paddingVertical: 11, paddingHorizontal: 14 },
  aiReportIcon:  { fontSize: 15 },
  aiReportTxt:   { flex: 1, color: C.tealTx, fontSize: 13, fontWeight: '700' },
  aiReportArrow: { color: C.tealTx, fontSize: 14, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 6, backgroundColor: C.tealBg, borderRadius: 12, borderWidth: 1, borderColor: C.brandA + '55', paddingVertical: 10, paddingHorizontal: 14 },
  bannerTxt:   { color: C.tealTx, fontSize: 13, fontWeight: '700', flex: 1 },
  bannerClose: { color: C.tealTx, fontSize: 14, fontWeight: '800', paddingLeft: 8 },
});
