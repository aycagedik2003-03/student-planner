import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { matchService, type ActiveMatch } from '../api/MatchService';
import { useAppStore } from '../store';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatList'>;
};

const C = {
  bg:     '#FFFFFF',
  bgSoft: '#FAFAFA',
  ink:    '#1F2937',
  soft:   '#4B5563',
  mute:   '#9CA3AF',
  line:   'rgba(31,41,55,0.08)',
  brandA: '#00CFC8',
  brandB: '#FF9ACD',
  tealBg: '#E6FBFA',
  tealTx: '#00A8A2',
};

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];

function avatarColor(id: string): string {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/** ActiveMatch'ten görüntülenecek normalize veri */
function normalizeMatch(m: ActiveMatch) {
  const user = m.matchedUser;
  const name = m.name ?? user?.name ?? 'Eşleşme';
  const initial = name.charAt(0).toUpperCase();
  const color = avatarColor(m.id);
  const lastMsg = m.lastMessage ?? '— Bir mesaj gönder! 👋';
  let timeStr = '';
  try {
    if (m.lastMessageAt) {
      timeStr = formatDistanceToNow(parseISO(m.lastMessageAt), {
        addSuffix: false, locale: tr,
      });
    }
  } catch { /* ignore */ }
  return { id: m.id, name, initial, color, lastMsg, timeStr, unread: m.unreadCount ?? 0 };
}

// ── Tek eşleşme satırı ────────────────────────────────────────────────────────
type MatchItem = ReturnType<typeof normalizeMatch>;

function MatchRow({ item, onPress }: { item: MatchItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={st.row} onPress={onPress} activeOpacity={0.72}>
      {/* Avatar */}
      <View style={[st.avatar, { backgroundColor: item.color }]}>
        <Text style={st.avatarTxt}>{item.initial}</Text>
      </View>

      {/* İçerik */}
      <View style={st.rowContent}>
        <View style={st.rowTop}>
          <Text style={st.rowName}>{item.name}</Text>
          {item.timeStr ? (
            <Text style={st.rowTime}>{item.timeStr}</Text>
          ) : null}
        </View>
        <View style={st.rowBottom}>
          <Text style={st.rowMsg} numberOfLines={1}>{item.lastMsg}</Text>
          {item.unread > 0 && (
            <View style={st.unreadBadge}>
              <Text style={st.unreadTxt}>{item.unread > 9 ? '9+' : item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Ana bileşen ────────────────────────────────────────────────────────────────
export default function ChatListScreen({ navigation }: Props) {
  const { activeMatches, setActiveMatches } = useAppStore();

  const [loading,  setLoading]  = useState(activeMatches.length === 0);
  const [error,    setError]    = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActive = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await matchService.getActive();
      setActiveMatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Eşleşmeler yüklenemedi.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setActiveMatches]);

  useEffect(() => { fetchActive(); }, [fetchActive]);

  const items = activeMatches.map(normalizeMatch);

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity
          style={st.hBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>Mesajlar</Text>
        <View style={[st.hBtn, { opacity: 0 }]} />
      </View>

      {/* Loading */}
      {loading && (
        <View style={st.center}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>Eşleşmeler yükleniyor…</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={st.center}>
          <Text style={st.errorIcon}>⚠</Text>
          <Text style={st.errorTxt}>{error}</Text>
          <TouchableOpacity style={st.retryBtn} onPress={() => fetchActive()} activeOpacity={0.8}>
            <Text style={st.retryTxt}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Boş durum */}
      {!loading && !error && items.length === 0 && (
        <View style={st.center}>
          <Text style={st.emptyIcon}>💬</Text>
          <Text style={st.emptyTitle}>Henüz eşleşme yok</Text>
          <Text style={st.emptySub}>
            Birini beğenince ve o da seni beğenince burada görünecek.
          </Text>
        </View>
      )}

      {/* Liste */}
      {!loading && !error && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MatchRow
              item={item}
              onPress={() => navigation.navigate('Chat', { matchId: item.id })}
            />
          )}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={7}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchActive(true);
          }}
          ItemSeparatorComponent={() => <View style={st.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn: {
    width: 38, height: 38, borderRadius: 999,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  hBtnTxt: { color: C.ink, fontSize: 17 },
  hTitle:  { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingTxt: { color: C.mute, fontSize: 14, marginTop: 14 },

  errorIcon: { fontSize: 32, marginBottom: 10 },
  errorTxt:  { color: C.soft, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  retryBtn:  { backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 28 },
  retryTxt:  { color: '#fff', fontSize: 14, fontWeight: '700' },

  emptyIcon:  { fontSize: 42, marginBottom: 14 },
  emptyTitle: { color: C.ink, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySub:   { color: C.soft, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  list: { paddingVertical: 8 },
  separator: { height: 1, backgroundColor: C.line, marginLeft: 82 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14, gap: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', shrink: 0,
  } as any,
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },

  rowContent: { flex: 1 },
  rowTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  rowName:    { color: C.ink, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  rowTime:    { color: C.mute, fontSize: 11 },
  rowBottom:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowMsg:     { flex: 1, color: C.mute, fontSize: 13, lineHeight: 18 },

  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 999,
    backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5, marginLeft: 8,
  },
  unreadTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
