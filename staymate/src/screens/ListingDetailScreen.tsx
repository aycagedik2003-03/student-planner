import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, FlatList, Dimensions, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { LISTINGS, type Listing } from '../data/listings';
import { listingService } from '../api/ListingService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ListingDetail'>;
  route: RouteProp<RootStackParamList, 'ListingDetail'>;
};

const { width: W } = Dimensions.get('window');

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD', pinkBg: '#FFF0F7', pinkTx: '#F06EB1',
};

type Feature = { icon: string; label: string; available: boolean };

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/'); }

// ── Photo carousel ────────────────────────────────────────────────────────────
function PhotoCarousel({
  photos, onBack, favorited, onFavorite,
}: {
  photos: string[];
  onBack: () => void;
  favorited: boolean;
  onFavorite: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setIdx(viewableItems[0].index ?? 0);
  });
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={st.carousel}>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfig.current}
        renderItem={({ item: photo }) =>
          isUrl(photo) ? (
            <Image source={{ uri: photo }} style={[st.photo, { width: W }]} resizeMode="cover" />
          ) : (
            <View style={[st.photo, { width: W, backgroundColor: photo }]}>
              <Text style={st.photoEmoji}>🏠</Text>
              <View style={st.photoOverlay} />
            </View>
          )
        }
      />

      {/* Pagination dots */}
      {photos.length > 1 && (
        <View style={st.dots}>
          {photos.map((_, i) => (
            <View key={i} style={[st.dot, i === idx && st.dotActive]} />
          ))}
        </View>
      )}

      {/* Back */}
      <TouchableOpacity style={st.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={st.backBtnTxt}>←</Text>
      </TouchableOpacity>

      {/* Heart */}
      <TouchableOpacity style={st.heartBtn} onPress={onFavorite} activeOpacity={0.8}>
        <Text style={[st.heartTxt, favorited && st.heartActive]}>
          {favorited ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ListingDetailScreen({ navigation, route }: Props) {
  const { listingId } = route.params;

  const [listing,   setListing]   = useState<Listing | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listingService
      .getListingDetail(listingId)
      .then(data => { if (!cancelled) { setListing(data); setLoading(false); } })
      .catch(() => {
        if (!cancelled) {
          const fallback = LISTINGS.find(l => l.id === listingId) ?? null;
          setListing(fallback);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [listingId]);

  const handleFavorite = async () => {
    setFavorited(f => !f);
    try {
      await listingService.addToFavorites(listingId);
    } catch {
      setFavorited(f => !f); // revert on error
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <TouchableOpacity style={[st.backBtn, { position: 'relative', margin: 16, top: 0, left: 0 }]}
          onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={st.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>İlan yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <TouchableOpacity style={[st.backBtn, { position: 'relative', margin: 16, top: 0, left: 0 }]}
          onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={st.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={st.loadingWrap}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🏠</Text>
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '700' }}>İlan bulunamadı</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: C.brandA, fontWeight: '600' }}>← Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const features: Feature[] = [
    { icon: '🪑', label: 'Mobilyalı',    available: listing.furnished    },
    { icon: '📶', label: 'WiFi',          available: listing.wifi         },
    { icon: '❄️', label: 'Klima',         available: listing.ac           },
    { icon: '🚗', label: 'Otopark',       available: listing.parking      },
    { icon: '🛗', label: 'Asansör',       available: listing.elevator     },
    { icon: '🐾', label: 'Evcil hayvan',  available: listing.petsAllowed  },
  ];

  return (
    <SafeAreaView style={st.root} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Photo carousel ── */}
      <PhotoCarousel
        photos={listing.photos}
        onBack={() => navigation.goBack()}
        favorited={favorited}
        onFavorite={handleFavorite}
      />

      {/* ── Scrollable content ── */}
      <ScrollView style={st.content} showsVerticalScrollIndicator={false} contentContainerStyle={st.contentPad}>

        {/* Price + address */}
        <View style={st.titleRow}>
          <View style={st.titleLeft}>
            <Text style={st.address}>{listing.address}</Text>
            {(listing.district || listing.city) && (
              <Text style={st.district}>
                📍 {[listing.district, listing.city].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
          <View style={st.priceBlock}>
            <Text style={st.price}>{listing.price.toLocaleString('tr-TR')}</Text>
            <Text style={st.priceSub}>PLN/ay</Text>
          </View>
        </View>

        {/* Stats chips */}
        <View style={st.statsRow}>
          <View style={st.statChip}>
            <Text style={st.statIcon}>🛏</Text>
            <Text style={st.statLabel}>{listing.rooms} Oda</Text>
          </View>
          {listing.area > 0 && (
            <View style={st.statChip}>
              <Text style={st.statIcon}>📐</Text>
              <Text style={st.statLabel}>{listing.area} m²</Text>
            </View>
          )}
          <View style={[st.statChip, st.statChipTeal]}>
            <Text style={st.statIcon}>✦</Text>
            <Text style={[st.statLabel, { color: C.tealTx }]}>Uygun</Text>
          </View>
        </View>

        <View style={st.divider} />

        {/* Description */}
        {listing.description ? (
          <>
            <Text style={st.sectionLabel}>AÇIKLAMA</Text>
            <Text style={st.description}>{listing.description}</Text>
            <View style={st.divider} />
          </>
        ) : null}

        {/* Features */}
        <Text style={st.sectionLabel}>ÖZELLİKLER</Text>
        <View style={st.featuresGrid}>
          {features.map((f, i) => (
            <View key={i} style={[st.featureItem, !f.available && st.featureItemOff]}>
              <Text style={st.featureIcon}>{f.icon}</Text>
              <Text style={[st.featureLabel, !f.available && st.featureLabelOff]}>{f.label}</Text>
              <Text style={[st.featureCheck, f.available ? st.featureCheckYes : st.featureCheckNo]}>
                {f.available ? '✓' : '✕'}
              </Text>
            </View>
          ))}
        </View>

        <View style={st.divider} />

        {/* Owner */}
        <Text style={st.sectionLabel}>EV SAHİBİ</Text>
        <View style={st.ownerCard}>
          <View style={[st.ownerAvatar, { backgroundColor: listing.owner.avatarColor }]}>
            <Text style={st.ownerAvatarTxt}>{listing.owner.initial}</Text>
          </View>
          <View style={st.ownerInfo}>
            <Text style={st.ownerName}>{listing.owner.name}</Text>
            <Text style={st.ownerRole}>Ev Sahibi · Genellikle hızlı yanıt verir</Text>
          </View>
          <View style={st.ownerRating}>
            <Text style={st.ownerRatingTxt}>⭐ 4.8</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed action buttons ── */}
      <View style={st.actions}>
        <TouchableOpacity
          style={[st.actionBtn, st.favoriteBtn]}
          onPress={handleFavorite}
          activeOpacity={0.8}
        >
          <Text style={[st.favoriteTxt, favorited && st.favoriteTxtActive]}>
            {favorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.actionBtn, st.messageBtn]}
          onPress={() => navigation.navigate('Chat', { matchId: listing.owner.matchId })}
          activeOpacity={0.85}
        >
          <Text style={st.messageTxt}>Mesaj Gönder →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { color: C.mute, fontSize: 14 },

  // Carousel
  carousel:     { height: 240, position: 'relative' },
  photo:        { height: 240, alignItems: 'center', justifyContent: 'center' },
  photoEmoji:   { fontSize: 56 },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(31,41,55,0.08)',
  },
  dots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot:       { width: 6, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  backBtn: {
    position: 'absolute', top: 44, left: 16,
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  backBtnTxt: { color: C.ink, fontSize: 17 },
  heartBtn: {
    position: 'absolute', top: 44, right: 16,
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  heartTxt:    { fontSize: 18, color: C.mute },
  heartActive: { color: C.brandB },

  // Content
  content:    { flex: 1 },
  contentPad: { paddingHorizontal: 20, paddingTop: 18 },

  titleRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  titleLeft:  { flex: 1, marginRight: 12 },
  address:    { color: C.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, lineHeight: 24 },
  district:   { color: C.mute, fontSize: 12, marginTop: 4 },
  priceBlock: { alignItems: 'flex-end' },
  price:      { color: C.brandA, fontSize: 22, fontWeight: '800' },
  priceSub:   { color: C.mute, fontSize: 11, marginTop: 1 },

  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.bgSoft, borderRadius: 10, borderWidth: 1, borderColor: C.line, paddingVertical: 6, paddingHorizontal: 10 },
  statChipTeal: { backgroundColor: C.tealBg, borderColor: C.brandA + '44' },
  statIcon:     { fontSize: 13 },
  statLabel:    { color: C.soft, fontSize: 12, fontWeight: '600' },

  divider:      { height: 1, backgroundColor: C.line, marginVertical: 14 },
  sectionLabel: { color: C.mute, fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10 },
  description:  { color: C.ink, fontSize: 14, lineHeight: 22 },

  featuresGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureItem:     { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgSoft, borderRadius: 12, borderWidth: 1, borderColor: C.line, paddingVertical: 10, paddingHorizontal: 12 },
  featureItemOff:  { opacity: 0.45 },
  featureIcon:     { fontSize: 16 },
  featureLabel:    { flex: 1, color: C.ink, fontSize: 12, fontWeight: '600' },
  featureLabelOff: { color: C.mute },
  featureCheck:    { fontSize: 13, fontWeight: '800' },
  featureCheckYes: { color: C.brandA },
  featureCheckNo:  { color: C.mute },

  ownerCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgSoft, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14 },
  ownerAvatar:    { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ownerAvatarTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  ownerInfo:      { flex: 1 },
  ownerName:      { color: C.ink, fontSize: 14, fontWeight: '700' },
  ownerRole:      { color: C.mute, fontSize: 11, marginTop: 3 },
  ownerRating:    { backgroundColor: '#FFF7E6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ownerRatingTxt: { color: '#D97706', fontSize: 12, fontWeight: '700' },

  actions:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  actionBtn:       { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  favoriteBtn:     { width: 48, height: 48, backgroundColor: C.pinkBg, borderWidth: 1.5, borderColor: C.brandB + '55' },
  favoriteTxt:     { color: C.mute, fontSize: 22 },
  favoriteTxtActive: { color: C.brandB },
  messageBtn:      { flex: 1, paddingVertical: 16, backgroundColor: C.brandA, shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6 },
  messageTxt:      { color: '#fff', fontSize: 16, fontWeight: '700' },
});
