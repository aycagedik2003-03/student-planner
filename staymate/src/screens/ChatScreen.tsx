// src/screens/ChatScreen.tsx — Chat List & Chat Detail

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENT, SHADOW, SPACING, RADII } from '../utils/constants';
import { Avatar } from '../components/Avatar';

type ChatTab = 'list' | 'detail';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  age: number;
  lastMessage: string;
  lastMessageTime: string;
  isRead: boolean;
  avatar: string;
  messages: ChatMessage[];
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Marta',
    age: 22,
    lastMessage: 'Sounds great! When can we meet?',
    lastMessageTime: '2 min ago',
    isRead: false,
    avatar: 'M',
    messages: [
      { id: '1', sender: 'them', text: 'Hi! I saw your profile', time: '10:30' },
      { id: '2', sender: 'me',   text: 'Hi Marta! Nice to meet you', time: '10:32' },
      { id: '3', sender: 'them', text: 'Sounds great! When can we meet?', time: '2 min ago' },
    ],
  },
  {
    id: '2',
    name: 'Alex',
    age: 23,
    lastMessage: "I'm interested in the apartment",
    lastMessageTime: '1 hour ago',
    isRead: true,
    avatar: 'A',
    messages: [
      { id: '1', sender: 'them', text: "I'm interested in the apartment", time: '1 hour ago' },
    ],
  },
  {
    id: '3',
    name: 'Jana',
    age: 21,
    lastMessage: 'Thanks for liking my profile!',
    lastMessageTime: '3 hours ago',
    isRead: false,
    avatar: 'J',
    messages: [
      { id: '1', sender: 'them', text: 'Thanks for liking my profile!', time: '3 hours ago' },
    ],
  },
];

// ─── Chat List Tab ────────────────────────────────────────────────────────────
function ChatListTab({ onChatPress }: { onChatPress: (id: string) => void }) {
  return (
    <FlatList
      data={MOCK_CHATS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onChatPress(item.id)}
          style={({ pressed }) => [s.chatListItem, pressed && { opacity: 0.8 }]}>
          <View style={{ position: 'relative' }}>
            <Avatar size={56} hue={0} label={item.avatar} />
            {!item.isRead && <View style={s.unreadBadge} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={s.chatListHeader}>
              <Text style={s.chatListName}>{item.name}, {item.age}</Text>
              <Text style={[s.chatListTime, !item.isRead && s.chatListTimeUnread]}>
                {item.lastMessageTime}
              </Text>
            </View>
            <Text
              style={[s.chatListMessage, !item.isRead && s.chatListMessageUnread]}
              numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

// ─── Chat Detail Tab ──────────────────────────────────────────────────────────
function ChatDetailTab({ chat, onBack, safeBottom }: { chat: Chat | null; onBack: () => void; safeBottom: number }) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const inputRef  = useRef<TextInput>(null);

  // Reset messages whenever we open a different chat
  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
      setInputText('');
    }
  }, [chat?.id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'me',
      text,
      time,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    // Re-focus so the keyboard stays open after sending
    inputRef.current?.focus();
  }, [inputText]);

  if (!chat) return null;

  const canSend = inputText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.chatDetailContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

      {/* Header */}
      <View style={s.chatDetailHeader}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={COLORS.ink} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.chatDetailName}>{chat.name}, {chat.age}</Text>
        </View>
        <Feather name="more-vertical" size={24} color={COLORS.muted} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messagesContainer}
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {messages.map((msg) => (
          <View key={msg.id} style={[s.messageRow, msg.sender === 'me' && s.messageRowMe]}>
            <View style={[s.messageBubble, msg.sender === 'me' && s.messageBubbleMe]}>
              {msg.sender === 'me' ? (
                <LinearGradient
                  colors={GRADIENT.brand as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.messageBubbleGradient}>
                  <Text style={s.messageTextMe}>{msg.text}</Text>
                </LinearGradient>
              ) : (
                <Text style={s.messageText}>{msg.text}</Text>
              )}
            </View>
            <Text style={[s.messageTime, msg.sender === 'me' && s.messageTimeMe]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input bar — paddingBottom uses device safe area since tab bar is hidden */}
      <View style={[s.inputContainer, { paddingBottom: Math.max(safeBottom, SPACING.md) }]}>
        <TextInput
          ref={inputRef}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          style={s.messageInput}
          multiline
          autoFocus
          editable
          keyboardType="default"
          returnKeyType="send"
          blurOnSubmit={false}
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            s.sendBtn,
            !canSend && s.sendBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}>
          <LinearGradient
            colors={GRADIENT.brand as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.sendBtnGradient}>
            <Feather name="send" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation                      = useNavigation();
  const { bottom: safeBottom }          = useSafeAreaInsets();
  const [activeTab, setActiveTab]       = useState<ChatTab>('list');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Hide the floating tab bar when the chat detail is open
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: activeTab === 'detail' ? { display: 'none' } : undefined,
    });
  }, [activeTab, navigation]);

  const handleChatPress = (id: string) => {
    const chat = MOCK_CHATS.find((c) => c.id === id) ?? null;
    setSelectedChat(chat);
    setActiveTab('detail');
  };

  const handleBack = () => {
    setActiveTab('list');
    setSelectedChat(null);
  };

  return (
    <SafeAreaView style={s.safe} edges={activeTab === 'detail' ? ['top'] : undefined}>
      <StatusBar barStyle="dark-content" />

      {activeTab === 'list' ? (
        <>
          <View style={s.header}>
            <Text style={s.headerTitle}>Messages</Text>
            <Pressable style={s.headerBtn}>
              <Feather name="plus" size={24} color={COLORS.secondary} />
            </Pressable>
          </View>

          <View style={s.searchContainer}>
            <Feather name="search" size={18} color={COLORS.muted} style={{ marginRight: SPACING.sm }} />
            <TextInput
              placeholder="Search chats..."
              placeholderTextColor={COLORS.muted}
              style={s.searchInput}
              keyboardType="default"
            />
          </View>

          <ChatListTab onChatPress={handleChatPress} />
        </>
      ) : (
        <ChatDetailTab chat={selectedChat} onBack={handleBack} safeBottom={safeBottom} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
  },

  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatListName: { fontSize: 15, fontWeight: '700', color: COLORS.ink, flex: 1 },
  chatListTime: { fontSize: 12, color: COLORS.muted },
  chatListTimeUnread: { fontWeight: '700', color: COLORS.secondary },
  chatListMessage: { fontSize: 13, color: COLORS.soft },
  chatListMessageUnread: { fontWeight: '600', color: COLORS.ink },

  chatDetailContainer: { flex: 1 },
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  chatDetailName: { fontSize: 16, fontWeight: '700', color: COLORS.ink },

  messagesContainer: { flex: 1 },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  messageRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  messageRowMe: { alignItems: 'flex-end' },

  messageBubble: {
    maxWidth: '75%',
    backgroundColor: COLORS.bgSoft,
    borderRadius: RADII.lg,
    borderBottomLeftRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  messageBubbleMe: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  messageBubbleGradient: {
    borderRadius: RADII.lg,
    borderBottomRightRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOW.glow,
  },
  messageText:   { color: COLORS.ink, fontSize: 14, lineHeight: 20 },
  messageTextMe: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  messageTime:   { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  messageTimeMe: { alignSelf: 'flex-end' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.bg,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.bgSoft,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.glow,
  },
});
