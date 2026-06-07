import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { chatService, type ChatMessage } from '../api/ChatService';
import { useT } from '../i18n/translations';
import type { ChatStackParamList } from '../navigation/BottomTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ChatStackParamList, 'ChatDetail'>;
  route:      RouteProp<ChatStackParamList, 'ChatDetail'>;
};

export default function ChatDetailScreen({ route, navigation }: Props) {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { chatId, name } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(chatId);
      console.log('[ChatDetail] Loaded messages:', data.length);
      setMessages(data);
    } catch (err) {
      console.error('[ChatDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const newMsg = await chatService.sendMessage(chatId, text);
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('[ChatDetail] Send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#7C5CFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('ChatList');
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{name || t('unknown')}</Text>
        </View>
        <Feather name="more-vertical" size={22} color="#999" />
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageRow,
            item.sender === 'me' ? styles.sentRow : styles.receivedRow,
          ]}>
            <View style={[
              styles.bubble,
              item.sender === 'me' ? styles.sentBubble : styles.receivedBubble,
            ]}>
              <Text style={[
                styles.bubbleText,
                item.sender === 'me' ? styles.sentText : styles.receivedText,
              ]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyText}>👋</Text>
            <Text style={styles.emptyLabel}>{t('say_hi') || 'Selam gönder!'}</Text>
          </View>
        }
      />

      {/* INPUT */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom || 8 }]}>
        <TextInput
          style={styles.input}
          placeholder={t('typeMessage')}
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
          editable={!sending}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons
            name="send"
            size={20}
            color={(!inputText.trim() || sending) ? '#ccc' : '#7C5CFF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn:      { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerName:   { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },

  messagesList: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },

  messageRow:   { flexDirection: 'row', marginVertical: 4 },
  sentRow:      { justifyContent: 'flex-end' },
  receivedRow:  { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble:     { backgroundColor: '#7C5CFF', borderBottomRightRadius: 4 },
  receivedBubble: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },

  bubbleText:   { fontSize: 15, lineHeight: 20 },
  sentText:     { color: '#fff' },
  receivedText: { color: '#333' },

  emptyMessages: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText:     { fontSize: 40 },
  emptyLabel:    { fontSize: 14, color: '#999', marginTop: 8 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#1a1a2e',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
