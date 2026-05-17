import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { landlordService } from '../api/LandlordService';
import type { Listing } from '../data/listings';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brand: '#00CFC8', brandBg: '#E6FBFA',
};

export default function LandlordProfileScreen({ navigation }: Props) {
  const user    = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);

  const [listings,  setListings]  = useState<Listing[]>([]);
  const [loading,   setLoading]   = useState(true);

  const avatarColor = '#00CFC8';
  const initial     = (user?.name ?? 'E').charAt(0).toUpperCase();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await landlordService.getMyListings();
      setListings(data);
    } catch {
      // ilanlar yüklenemezse sessizce geç
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const InfoRow = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <View style={st.infoRow}>
        <Text style={st.infoLabel}>{label}</Text>
        <Text style={st.infoValue}>{value}</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={st.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={st.header}>
          <Text style={st.pageTitle}>Profilim</Text>
          <Pressable
            style={st.editBtn}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Text style={st.editBtnTxt}>Düzenle</Text>
          </Pressable>
        </View>

        {/* Avatar + isim */}
        <View style={st.heroSection}>
          <View style={[st.avatar, { backgroundColor: avatarColor }]}>
            <Text style={st.avatarTxt}>{initial}</Text>
          </View>
          <Text style={st.name}>{user?.name ?? '—'}</Text>
          <View style={st.roleBadge}>
            <Text style={st.roleTxt}>🏠 Ev Sahibi</Text>
          </View>
        </View>

        {/* Bilgiler */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Kişisel Bilgiler</Text>
          <InfoRow label="E-posta"  value={user?.email} />
          <InfoRow label="Şehir"    value={profile?.city} />
          <InfoRow label="Telefon"  value={(profile as any)?.phone} />
        </View>

        {/* İlanlar özeti */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>İlanlarım</Text>
            <Pressable onPress={() => navigation.navigate('MyListings')}>
              <Text style={st.seeAll}>Tümü →</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={C.brand} style={{ marginTop: 16 }} />
          ) : listings.length === 0 ? (
            <View style={st.emptyListings}>
              <Text style={st.emptyTxt}>Henüz ilan yok.</Text>
              <Pressable
                style={st.createBtn}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={st.createBtnTxt}>+ İlan Oluştur</Text>
              </Pressable>
            </View>
          ) : (
            listings.slice(0, 3).map((item) => (
              <Pressable
                key={item.id}
                style={st.listingCard}
                onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
              >
                <View style={[st.listingStrip, { backgroundColor: item.photos[0] ?? C.brand }]} />
                <View style={st.listingBody}>
                  <Text style={st.listingTitle} numberOfLines={1}>{item.address}</Text>
                  <Text style={st.listingSub}>{item.city} · {item.rooms} oda · {item.price} PLN/ay</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  pageTitle:   { fontSize: 22, fontWeight: '800', color: C.ink },
  editBtn:     { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  editBtnTxt:  { color: C.brand, fontWeight: '700', fontSize: 14 },
  heroSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: C.line },
  avatar:      { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt:   { color: '#fff', fontSize: 32, fontWeight: '800' },
  name:        { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 8 },
  roleBadge:   { backgroundColor: '#FEF9C3', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14 },
  roleTxt:     { color: '#854D0E', fontSize: 13, fontWeight: '700' },
  section:     { marginHorizontal: 20, marginTop: 24 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.ink, marginBottom: 14 },
  seeAll:      { color: C.brand, fontSize: 13, fontWeight: '700' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  infoLabel:   { fontSize: 14, color: C.mute },
  infoValue:   { fontSize: 14, color: C.ink, fontWeight: '600' },
  emptyListings: { alignItems: 'center', paddingVertical: 20 },
  emptyTxt:   { color: C.mute, fontSize: 14, marginBottom: 14 },
  createBtn:  { backgroundColor: C.brand, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 20 },
  createBtnTxt:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  listingCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 10, backgroundColor: C.bgSoft },
  listingStrip:{ width: 6 },
  listingBody: { flex: 1, padding: 14 },
  listingTitle:{ fontSize: 14, fontWeight: '700', color: C.ink },
  listingSub:  { fontSize: 12, color: C.mute, marginTop: 4 },
});
