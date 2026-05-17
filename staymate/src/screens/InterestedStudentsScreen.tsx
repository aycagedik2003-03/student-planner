import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, LandlordTabParamList } from '../../App';
import { landlordService, type InterestedStudent } from '../api/LandlordService';

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
  pink: '#FF9ACD', pinkBg: '#FFF0F7', pinkTx: '#F06EB1',
};

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];

export default function InterestedStudentsScreen({ navigation }: Props) {
  const [students,   setStudents]   = useState<InterestedStudent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await landlordService.getInterestedStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Öğrenciler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const renderItem = ({ item }: { item: InterestedStudent }) => {
    const initial = item.name.charAt(0).toUpperCase();
    return (
      <View style={st.card}>
        {/* Avatar */}
        <View style={[st.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={st.avatarTxt}>{initial}</Text>
        </View>

        {/* Info */}
        <View style={st.info}>
          <View style={st.nameRow}>
            <Text style={st.name}>{item.name}</Text>
            <Text style={st.age}>, {item.age}</Text>
          </View>

          {item.city ? (
            <Text style={st.sub}>📍 {item.city}</Text>
          ) : null}
          {item.university ? (
            <Text style={st.sub}>🎓 {item.university}</Text>
          ) : null}
          {item.listingTitle ? (
            <View style={st.listingTag}>
              <Text style={st.listingTagTxt} numberOfLines={1}>🏠 {item.listingTitle}</Text>
            </View>
          ) : null}

          <View style={st.footer}>
            <View style={st.matchBadge}>
              <Text style={st.matchTxt}>✦ {item.matchScore}% uyum</Text>
            </View>
            <Pressable
              style={st.msgBtn}
              onPress={() => navigation.navigate('Chat', { matchId: item.id })}
            >
              <Text style={st.msgBtnTxt}>💬 Mesaj Gönder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Text style={st.title}>İlgilenen Öğrenciler</Text>
        <Text style={st.count}>
          {students.length > 0 ? `${students.length} kişi` : ''}
        </Text>
      </View>

      {loading ? (
        <View style={st.center}>
          <ActivityIndicator color={C.brand} size="large" />
        </View>
      ) : error ? (
        <View style={st.center}>
          <Text style={st.errorIcon}>⚠</Text>
          <Text style={st.errorTxt}>{error}</Text>
          <Pressable style={st.retryBtn} onPress={() => load()}>
            <Text style={st.retryTxt}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : students.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyIcon}>🎓</Text>
          <Text style={st.emptyTitle}>Henüz ilgilenen yok</Text>
          <Text style={st.emptySub}>
            İlanlarını yayınladıktan sonra öğrenciler burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  title:  { fontSize: 22, fontWeight: '800', color: C.ink },
  count:  { fontSize: 14, color: C.mute },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon:  { fontSize: 40, marginBottom: 12 },
  errorTxt:   { color: C.soft, fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:   { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  retryTxt:   { color: C.brand, fontWeight: '700', fontSize: 14 },
  emptyIcon:  { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: C.soft, textAlign: 'center', lineHeight: 22 },
  card:      { flexDirection: 'row', backgroundColor: C.bgSoft, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16, gap: 14 },
  avatar:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '800' },
  info:    { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  name:    { fontSize: 16, fontWeight: '800', color: C.ink },
  age:     { fontSize: 14, color: C.soft },
  sub:     { fontSize: 12, color: C.mute, marginBottom: 2 },
  listingTag:    { alignSelf: 'flex-start', backgroundColor: '#FEF9C3', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, marginTop: 6 },
  listingTagTxt: { fontSize: 11, color: '#854D0E', fontWeight: '600', maxWidth: 200 },
  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  matchBadge: { backgroundColor: C.brandBg, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  matchTxt:   { color: C.brandTx, fontSize: 12, fontWeight: '700' },
  msgBtn:     { backgroundColor: C.brand, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  msgBtnTxt:  { color: '#fff', fontSize: 12, fontWeight: '700' },
});
