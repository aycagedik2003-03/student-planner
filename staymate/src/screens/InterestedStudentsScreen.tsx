import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, LandlordTabParamList } from '../../App';
import { listingService } from '../api/ListingService';
import { landlordService } from '../api/LandlordService';
import { useAppStore } from '../store';
import type { Listing } from '../data/listings';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<LandlordTabParamList, 'InterestedStudents'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brand: '#00CFC8', brandBg: '#E6FBFA', brandTx: '#00A8A2',
};

type Student = {
  id: string;
  name?: string;
  age?: number;
  city?: string;
  university?: string;
  match_score?: number;
  matchScore?: number;
  avatarColor?: string;
};

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];
function colorFromId(id: string): string {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function InterestedStudentsScreen({ navigation }: Props) {
  const user = useAppStore((s) => s.user);

  const [myListings,      setMyListings]      = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [students,        setStudents]        = useState<Student[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [refreshing,      setRefreshing]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // İlk yüklemede landlord'un ilanlarını çek
  const loadListings = useCallback(async () => {
    if (!user?.id) return;
    setLoadingListings(true);
    try {
      const data = await listingService.getListingsByLandlord(user.id);
      setMyListings(data);
      if (data.length > 0 && !selectedListing) {
        setSelectedListing(data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İlanlar yüklenemedi.');
    } finally {
      setLoadingListings(false);
    }
  }, [user?.id, selectedListing]);

  // Seçili ilana ilgi gösteren öğrencileri çek
  const loadStudents = useCallback(async (listingId: string, silent = false) => {
    if (!silent) setLoadingStudents(true);
    setError(null);
    try {
      // GET /listings/{listingId}/interested-students
      const data = await listingService.getInterestedStudents(listingId);
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Öğrenciler yüklenemedi.');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadListings(); }, []);                        // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedListing) loadStudents(selectedListing.id);
  }, [selectedListing?.id]);                                       // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedListing) loadStudents(selectedListing.id, true);
  }, [selectedListing, loadStudents]);

  const handleOpenChat = (student: Student) => {
    navigation.navigate('Chat', { matchId: student.id });
  };

  const renderStudent = ({ item }: { item: Student }) => {
    const initial     = (item.name ?? 'Ö').charAt(0).toUpperCase();
    const avatarColor = item.avatarColor ?? colorFromId(item.id);
    const score       = item.matchScore ?? item.match_score ?? 0;

    return (
      <View style={st.card}>
        <View style={[st.avatar, { backgroundColor: avatarColor }]}>
          <Text style={st.avatarTxt}>{initial}</Text>
        </View>
        <View style={st.info}>
          <View style={st.nameRow}>
            <Text style={st.name}>{item.name ?? 'Öğrenci'}</Text>
            {item.age ? <Text style={st.age}>, {item.age}</Text> : null}
          </View>
          {item.city       && <Text style={st.sub}>📍 {item.city}</Text>}
          {item.university && <Text style={st.sub}>🎓 {item.university}</Text>}
          <View style={st.footer}>
            {score > 0 && (
              <View style={st.matchBadge}>
                <Text style={st.matchTxt}>✦ {score}% uyum</Text>
              </View>
            )}
            <Pressable style={st.msgBtn} onPress={() => handleOpenChat(item)}>
              <Text style={st.msgBtnTxt}>💬 Mesaj</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>İlgilenen Öğrenciler</Text>
        {students.length > 0 && (
          <Text style={st.count}>{students.length} kişi</Text>
        )}
      </View>

      {/* İlan seçici şerit */}
      {loadingListings ? (
        <ActivityIndicator color={C.brand} style={{ margin: 16 }} />
      ) : myListings.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>🏠</Text>
          <Text style={st.emptyTitle}>Henüz ilan yok</Text>
          <Text style={st.emptySub}>İlan yayınlayarak öğrencilerden ilgi alabilirsin.</Text>
          <Pressable style={st.ctaBtn} onPress={() => navigation.navigate('CreateListing')}>
            <Text style={st.ctaBtnTxt}>+ İlan Oluştur</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.listingStrip}
          >
            {myListings.map((listing) => (
              <Pressable
                key={listing.id}
                style={[
                  st.listingChip,
                  selectedListing?.id === listing.id && st.listingChipActive,
                ]}
                onPress={() => setSelectedListing(listing)}
              >
                <Text style={[
                  st.listingChipTxt,
                  selectedListing?.id === listing.id && st.listingChipTxtActive,
                ]} numberOfLines={1}>
                  {listing.address}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {loadingStudents ? (
            <View style={st.center}>
              <ActivityIndicator color={C.brand} size="large" />
            </View>
          ) : error ? (
            <View style={st.center}>
              <Text style={st.errorIcon}>⚠</Text>
              <Text style={st.errorTxt}>{error}</Text>
              <Pressable style={st.retryBtn} onPress={() => selectedListing && loadStudents(selectedListing.id)}>
                <Text style={st.retryTxt}>Tekrar Dene</Text>
              </Pressable>
            </View>
          ) : students.length === 0 ? (
            <View style={st.center}>
              <Text style={st.emptyIcon}>🎓</Text>
              <Text style={st.emptyTitle}>Henüz ilgilenen yok</Text>
              <Text style={st.emptySub}>Bu ilana henüz kimse ilgi göstermedi.</Text>
            </View>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(s) => s.id}
              renderItem={renderStudent}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(31,41,55,0.08)' },
  title:  { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  count:  { fontSize: 14, color: '#9CA3AF' },
  listingStrip: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  listingChip:  { borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'rgba(31,41,55,0.08)', maxWidth: 160 },
  listingChipActive:    { backgroundColor: C.brandBg, borderColor: C.brand },
  listingChipTxt:       { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  listingChipTxtActive: { color: C.brand },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon:  { fontSize: 40, marginBottom: 12 },
  errorTxt:   { color: '#4B5563', fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:   { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  retryTxt:   { color: C.brand, fontWeight: '700', fontSize: 14 },
  emptyIcon:  { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  emptySub:   { fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  ctaBtn:     { backgroundColor: C.brand, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  ctaBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  card:      { flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(31,41,55,0.08)', padding: 16, gap: 14 },
  avatar:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '800' },
  info:    { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  name:    { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  age:     { fontSize: 14, color: '#4B5563' },
  sub:     { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  matchBadge: { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  matchTxt:   { color: C.brandTx, fontSize: 12, fontWeight: '700' },
  msgBtn:     { backgroundColor: C.brand, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  msgBtnTxt:  { color: '#fff', fontSize: 12, fontWeight: '700' },
});
