import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatPreview = {
  id: string;
  match_id: string;
  name: string;
  avatar_url: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: Date;
};

// ── Service ───────────────────────────────────────────────────────────────────

export class ChatService {
  private API_URL = 'https://web-production-63097.up.railway.app/api/v1';
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('userToken');
    }
    return this.token;
  }

  // MOCK: Matches'den eşleşmiş kişileri al (gerçekte: GET /matches/active)
  async getChats(): Promise<ChatPreview[]> {
    return [
      {
        id: '1',
        match_id: 'match_001',
        name: 'Tuana Gedik',
        avatar_url: null,
        lastMessage: 'Merhaba! Nasılsın?',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 2,
      },
      {
        id: '2',
        match_id: 'match_002',
        name: 'Ada Eren',
        avatar_url: null,
        lastMessage: 'Cumartesi görüşebilir misin?',
        lastMessageTime: new Date(Date.now() - 7200000),
        unreadCount: 0,
      },
      {
        id: '3',
        match_id: 'match_003',
        name: 'Zeynep Koç',
        avatar_url: null,
        lastMessage: 'Fotoğraf attım bakar mısın?',
        lastMessageTime: new Date(Date.now() - 86400000),
        unreadCount: 1,
      },
    ];
  }

  // MOCK: Belirli bir chat'in mesajlarını al (gerçekte: GET /messages/{matchId})
  async getMessages(matchId: string): Promise<ChatMessage[]> {
    const mockMessages: Record<string, ChatMessage[]> = {
      match_001: [
        { id: '1', sender: 'me',    text: 'Merhaba!',         timestamp: new Date(Date.now() - 7200000) },
        { id: '2', sender: 'other', text: 'Merhaba! Nasılsın?', timestamp: new Date(Date.now() - 3600000) },
        { id: '3', sender: 'me',    text: 'İyiyim, sen?',     timestamp: new Date(Date.now() - 1800000) },
      ],
      match_002: [
        { id: '1', sender: 'other', text: 'Cumartesi görüşebilir misin?', timestamp: new Date(Date.now() - 7200000) },
        { id: '2', sender: 'me',    text: 'Tabii, saati söyler misin?',   timestamp: new Date(Date.now() - 3600000) },
      ],
    };
    return mockMessages[matchId] ?? [];
  }

  // Mesaj gönder (mock — gerçekte: POST /messages/send)
  async sendMessage(matchId: string, text: string): Promise<ChatMessage> {
    console.log('[ChatService] Mesaj gönderiliyor:', matchId, text);
    return {
      id: Date.now().toString(),
      sender: 'me',
      text,
      timestamp: new Date(),
    };
  }

  // Oku olarak işaretle (mock — gerçekte: PATCH /messages/{matchId}/read)
  async markAsRead(matchId: string): Promise<void> {
    console.log('[ChatService] Okundu işaretlendi:', matchId);
  }
}

export const chatService = new ChatService();
