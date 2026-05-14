import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  FlatList, TextInput, Modal, Animated,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { scheduleMessageNotification } from '../services/NotificationService';
import { useAppStore, type ChatMessage } from '../store';
import { chatService } from '../api/ChatService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
  route: RouteProp<RootStackParamList, 'Chat'>;
};

const C = {
  bg:         '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute:       '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA:     '#00CFC8', brandB: '#FF9ACD',
  tealBg:     '#E6FBFA', tealTx: '#00A8A2',
  pinkBg:     '#FFF0F7', pinkTx: '#F06EB1',
  bubbleMe:   '#00CFC8',
  bubbleThem: '#F3F4F6',
};

// ── Aktif eşleşme görüntüsü (activeMatches'tan veya fallback) ─────────────────
type ChatPeer = {
  name: string; initial: string; avatarColor: string; match: number;
  city: string;
  compat: { sleep: number; clean: number; social: number; work: number; lifestyle: number };
  traits: string[];
};

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];
function pickColor(id: string) {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function resolvePeer(matchId: string, activeMatches: ReturnType<typeof useAppStore.getState>['activeMatches']): ChatPeer {
  const found = activeMatches.find(m => m.id === matchId);
  if (found) {
    const u = found.matchedUser;
    const name = found.name ?? u?.name ?? 'Eşleşme';
    return {
      name,
      initial:     name.charAt(0).toUpperCase(),
      avatarColor: pickColor(matchId),
      match:       0,
      city:        (found as any).city ?? u?.city ?? '',
      compat:      { sleep: 0, clean: 0, social: 0, work: 0, lifestyle: 0 },
      traits:      [],
    };
  }
  return {
    name:        'Eşleşme',
    initial:     '?',
    avatarColor: pickColor(matchId),
    match:       0, city: '', compat: { sleep: 0, clean: 0, social: 0, work: 0, lifestyle: 0 },
    traits:      [],
  };
}

// ── Başlangıç mesajları (socket bağlı değilken gösterilir) ────────────────────
const SEED_MESSAGES: ChatMessage[] = [
  { id: 's1', sender: 'them', text: 'Merhaba! 👋 Eşleştik, çok heyecanlandım!', time: '14:30' },
  { id: 's2', sender: 'me',   text: 'Ben de! Profilini inceledim, çok uyumluyuz.', time: '14:31' },
  { id: 's3', sender: 'them', text: 'Evet, birlikte ev bakabilir miyiz? 🏠', time: '14:32' },
];

const COMPAT_LABELS: { key: keyof ChatPeer['compat']; label: string }[] = [
  { key: 'sleep', label: 'Uyku düzeni' }, { key: 'clean', label: 'Temizlik' },
  { key: 'social', label: 'Sosyallik' }, { key: 'work', label: 'Çalışma' },
  { key: 'lifestyle', label: 'Yaşam tarzı' },
];

// ── Ana bileşen ────────────────────────────────────────────────────────────────
export default function ChatScreen({ navigation, route }: Props) {
  const { matchId } = route.params;

  const token          = useAppStore(s => s.token);
  const activeMatches  = useAppStore(s => s.activeMatches);
  const storeMessages  = useAppStore(s => s.messages[matchId]);
  const addMessage     = useAppStore(s => s.addMessage);
  const setMessages    = useAppStore(s => s.setMessages);

  const peer = resolvePeer(matchId, activeMatches);

  // Mesajları store'dan al; yoksa seed mesajlarıyla başla
  const [messages, setLocalMessages] = useState<ChatMessage[]>(
    storeMessages && storeMessages.length > 0 ? storeMessages : SEED_MESSAGES,
  );
  const [inputText, setInputText] = useState('');
  const [showInfo,  setShowInfo]  = useState(false);
  const [socketOk,  setSocketOk]  = useState(false);

  const listRef   = useRef<FlatList>(null);
  const infoScale = useRef(new Animated.Value(0.88)).current;
  const infoAlpha = useRef(new Animated.Value(0)).current;

  // ── Socket bağlantısı ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    chatService.connect(token).then(() => {
      setSocketOk(chatService.isConnected());
      chatService.joinRoom(matchId);

      chatService.onMessageReceived((incoming) => {
        const now = new Date();
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newMsg: ChatMessage = {
          id:     incoming.id ?? String(Date.now()),
          sender: 'them',
          text:   incoming.content,
          time,
        };
        addMessage(matchId, newMsg);
        setLocalMessages(prev => [...prev, newMsg]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

        const { notificationPreferences } = useAppStore.getState();
        if (notificationPreferences.messages) {
          scheduleMessageNotification(peer.name, incoming.content, 0);
        }
      });
    });

    // Sayfa kapatılırken odadan ayrıl
    return () => {
      chatService.leaveRoom(matchId);
      // Store'u güncelle (mesajlar persist edilsin)
      setMessages(matchId, messages);
    };
  }, [matchId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Info modal ─────────────────────────────────────────────────────────────
  const openInfo = () => {
    setShowInfo(true);
    Animated.parallel([
      Animated.spring(infoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(infoAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  const closeInfo = () => {
    Animated.parallel([
      Animated.timing(infoScale, { toValue: 0.92, duration: 150, useNativeDriver: true }),
      Animated.timing(infoAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => { setShowInfo(false); infoScale.setValue(0.88); });
  };

  // ── Mesaj gönder ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const now  = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ChatMessage = { id: String(Date.now()), sender: 'me', text, time };

    // Önce UI'ya ekle (optimistic update)
    setLocalMessages(prev => [...prev, newMsg]);
    addMessage(matchId, newMsg);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    // Socket'e gönder (bağlıysa)
    if (socketOk) {
      chatService.sendMessage(matchId, text);
    }

    const { notificationPreferences } = useAppStore.getState();
    if (notificationPreferences.messages) {
      scheduleMessageNotification(peer.name, 'Yeni bir mesajın var 👋', 5);
    }
  }, [inputText, matchId, socketOk, peer.name, addMessage]);

  // ── Render mesaj ───────────────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe       = item.sender === 'me';
    const prevSender = index > 0 ? messages[index - 1].sender : null;
    const showAvatar = !isMe && prevSender !== 'them';

    return (
      <View style={[st.msgRow, isMe ? st.msgRowMe : st.msgRowThem]}>
        {!isMe && (
          <View style={st.msgAvatarSlot}>
            {showAvatar && (
              <View style={[st.msgAvatar, { backgroundColor: peer.avatarColor }]}>
                <Text style={st.msgAvatarTxt}>{peer.initial}</Text>
              </View>
            )}
          </View>
        )}
        <View style={[st.bubble, isMe ? st.bubbleMe : st.bubbleThem]}>
          <Text style={[st.bubbleTxt, isMe ? st.bubbleTxtMe : st.bubbleTxtThem]}>{item.text}</Text>
          <Text style={[st.bubbleTime, isMe ? st.bubbleTimeMe : st.bubbleTimeThem]}>
            {item.time}{isMe && ' ✓'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.hCenter} onPress={openInfo} activeOpacity={0.8}>
          <View style={[st.hAvatar, { backgroundColor: peer.avatarColor }]}>
            <Text style={st.hAvatarTxt}>{peer.initial}</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={st.hName}>{peer.name}</Text>
              {/* Socket bağlantı indikatörü */}
              <View style={[st.connDot, { backgroundColor: socketOk ? C.brandA : C.mute }]} />
            </View>
            <Text style={st.hSub}>{peer.city || (socketOk ? 'Çevrimiçi' : 'Bağlanıyor…')}</Text>
          </View>
          {peer.match > 0 && (
            <View style={st.matchBadge}>
              <Text style={st.matchBadgeTxt}>✦ {peer.match}%</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={st.hBtn} onPress={openInfo} activeOpacity={0.7}>
          <Text style={st.hInfoTxt}>ℹ</Text>
        </TouchableOpacity>
      </View>

      <View style={st.divider} />

      {/* Mesaj listesi + input */}
      <KeyboardAvoidingView
        style={st.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={st.messageList}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        <View style={st.inputRow}>
          <TextInput
            style={st.input}
            placeholder="Mesaj yaz..."
            placeholderTextColor={C.mute}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[st.sendBtn, !inputText.trim() && st.sendBtnOff]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={st.sendBtnTxt}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Info modal */}
      <Modal visible={showInfo} transparent animationType="none" onRequestClose={closeInfo}>
        <View style={st.infoOverlay}>
          <TouchableOpacity style={st.infoBackdrop} onPress={closeInfo} activeOpacity={1} />
          <Animated.View style={[st.infoCard, { opacity: infoAlpha, transform: [{ scale: infoScale }] }]}>
            <View style={st.infoHero}>
              <View style={[st.infoAvatar, { backgroundColor: peer.avatarColor }]}>
                <Text style={st.infoAvatarTxt}>{peer.initial}</Text>
              </View>
              <View style={st.infoHeroRight}>
                <Text style={st.infoName}>{peer.name}</Text>
                {peer.city ? <Text style={st.infoSub}>📍 {peer.city}</Text> : null}
                {peer.match > 0 && (
                  <View style={st.infoMatchPill}>
                    <Text style={st.infoMatchTxt}>✦ {peer.match}% uyum</Text>
                  </View>
                )}
              </View>
            </View>

            {peer.compat.sleep > 0 && (
              <>
                <View style={st.infoDivider} />
                <Text style={st.infoSectionLabel}>Uyumluluk Detayı</Text>
                {COMPAT_LABELS.map(({ key, label }) => {
                  const pct = peer.compat[key];
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
              </>
            )}

            {peer.traits.length > 0 && (
              <>
                <View style={st.infoDivider} />
                <Text style={st.infoSectionLabel}>Özellikler</Text>
                <View style={st.traitRow}>
                  {peer.traits.map((t, i) => (
                    <View key={i} style={[st.traitChip, i % 2 === 0 ? st.traitT : st.traitP]}>
                      <Text style={[st.traitTxt, i % 2 === 0 ? st.traitTTxt : st.traitPTxt]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={st.infoClose} onPress={closeInfo} activeOpacity={0.8}>
              <Text style={st.infoCloseTxt}>Kapat</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  hBtn:     { width: 38, height: 38, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  hBtnTxt:  { color: C.ink, fontSize: 17 },
  hInfoTxt: { color: C.mute, fontSize: 18, fontWeight: '600' },
  hCenter:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hAvatar:  { width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  hAvatarTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  hName:  { color: C.ink, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  hSub:   { color: C.mute, fontSize: 11, marginTop: 1 },
  connDot: { width: 7, height: 7, borderRadius: 999 },
  matchBadge: { backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  matchBadgeTxt: { color: C.tealTx, fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.line },
  messageList: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 6 },
  msgRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe:   { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgAvatarSlot: { width: 28, alignItems: 'center', justifyContent: 'flex-end' },
  msgAvatar:    { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  msgAvatarTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  bubble:        { maxWidth: '72%', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleMe:      { backgroundColor: C.bubbleMe, borderBottomRightRadius: 6 },
  bubbleThem:    { backgroundColor: C.bubbleThem, borderBottomLeftRadius: 6 },
  bubbleTxt:     { fontSize: 15, lineHeight: 22 },
  bubbleTxtMe:   { color: '#fff' },
  bubbleTxtThem: { color: C.ink },
  bubbleTime:    { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMe:  { color: 'rgba(255,255,255,0.65)' },
  bubbleTimeThem:{ color: C.mute },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  input: { flex: 1, minHeight: 42, maxHeight: 110, backgroundColor: C.bgSoft, borderRadius: 22, borderWidth: 1, borderColor: C.line, paddingHorizontal: 16, paddingVertical: 10, color: C.ink, fontSize: 15 },
  sendBtn:    { width: 42, height: 42, borderRadius: 999, backgroundColor: C.brandA, alignItems: 'center', justifyContent: 'center', shadowColor: C.brandA, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  sendBtnOff: { backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, shadowOpacity: 0, elevation: 0 },
  sendBtnTxt: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 24 },
  infoOverlay:  { flex: 1, backgroundColor: 'rgba(10,18,30,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  infoBackdrop: { ...StyleSheet.absoluteFillObject },
  infoCard:     { width: '100%', backgroundColor: C.bg, borderRadius: 28, padding: 22, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 40, elevation: 20 },
  infoHero:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  infoAvatar:   { width: 60, height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  infoAvatarTxt:  { color: '#fff', fontSize: 22, fontWeight: '800' },
  infoHeroRight:  { flex: 1 },
  infoName:       { color: C.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  infoSub:        { color: C.mute, fontSize: 12, marginTop: 2 },
  infoMatchPill:  { alignSelf: 'flex-start', marginTop: 6, backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  infoMatchTxt:   { color: C.tealTx, fontSize: 12, fontWeight: '700' },
  infoDivider:    { height: 1, backgroundColor: C.line, marginVertical: 14 },
  infoSectionLabel:{ color: C.mute, fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12 },
  compatRow:      { marginBottom: 10 },
  compatLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  compatLabel:    { color: C.soft, fontSize: 12 },
  compatPct:      { color: C.ink, fontSize: 12, fontWeight: '700' },
  compatBarBg:    { height: 5, backgroundColor: C.line, borderRadius: 999, overflow: 'hidden' },
  compatBarFill:  { height: '100%', borderRadius: 999 },
  fillTeal: { backgroundColor: C.brandA },
  fillPink: { backgroundColor: C.brandB },
  traitRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  traitChip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1 },
  traitT: { backgroundColor: C.tealBg, borderColor: C.brandA + '44' },
  traitP: { backgroundColor: C.pinkBg, borderColor: C.brandB + '44' },
  traitTxt:  { fontSize: 12, fontWeight: '600' },
  traitTTxt: { color: C.tealTx },
  traitPTxt: { color: C.pinkTx },
  infoClose: { marginTop: 16, backgroundColor: C.bgSoft, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  infoCloseTxt: { color: C.soft, fontSize: 14, fontWeight: '600' },
});
