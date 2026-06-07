import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { chatService, type ChatPreview } from '../api/ChatService';
import { useTranslation } from '../i18n/translations';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatList'>;
};

export default function ChatListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [chats, setChats]         = useState<ChatPreview[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getChats();
      console.log('[ChatList] Loaded chats:', data.length);
      setChats(data);
    } catch (err: any) {
      console.error('[ChatList] Error:', err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []); // t bağımlılığı döngüye neden oluyordu

  useEffect(() => { loadChats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: ChatPreview) => {
    (navigation as any).navigate('ChatDetail', {
      chatId:     chat.match_id,
      name:       chat.name,
      avatar_url: chat.avatar_url,
    });
  };

  const getInitial = (name: string | null) =>
    name && typeof name === 'string' ? name.charAt(0).toUpperCase() : '?';

  const getTimeAgo = (date: Date | string | number): string => {
    try {
      const d    = date instanceof Date ? date : new Date(date);
      const diff    = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours   = Math.floor(diff / 3600000);
      const days    = Math.floor(diff / 86400000);
      if (minutes < 60) return `${minutes}m`;
      if (hours   < 24) return `${hours}h`;
      if (days    <  7) return `${days}d`;
      return d.toLocaleDateString('tr-TR');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C5CFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (chats.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabs.messages')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{t('chat.noMatches')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.messages')}</Text>
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatCard}
            onPress={() => handleChatPress(item)}
            activeOpacity={0.7}
          >
            {/* AVATAR */}
            <View style={styles.avatarContainer}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{getInitial(item.name)}</Text>
                </View>
              )}
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>

            {/* CONTENT */}
            <View style={styles.contentContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.timeText}>{getTimeAgo(item.lastMessageTime)}</Text>
              </View>
              <Text
                style={[styles.messageText, item.unreadCount > 0 && styles.unreadMessage]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#f9f9f9' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1a1a2e' },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },

  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar:          { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f0f0f0' },
  avatarFallback:  {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#7C5CFF', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },

  unreadBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FF6B6B', borderRadius: 10,
    minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  contentContainer: { flex: 1 },
  nameRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  nameText:      { fontSize: 16, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  timeText:      { fontSize: 12, color: '#999', marginLeft: 8 },
  messageText:   { fontSize: 14, color: '#666' },
  unreadMessage: { color: '#1a1a2e', fontWeight: '500' },

  chevron:   { fontSize: 28, color: '#ccc', marginLeft: 8 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center' },
});
