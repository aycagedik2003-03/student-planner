import { io, Socket } from 'socket.io-client';

// Socket.io base URL — /api/v1 path'ini çıkar, sadece origin kullan
const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL ?? '')
  .replace(/\/api\/v1\/?$/, '');

// ── Types ─────────────────────────────────────────────────────────────────────

export type IncomingMessage = {
  id: string;
  matchId: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export type MessageCallback = (msg: IncomingMessage) => void;

// ── Singleton socket instance ─────────────────────────────────────────────────

let socket: Socket | null = null;

// ── Service ───────────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * Socket.io bağlantısı kurar.
   * connect_error olursa resolve eder (uygulamayı bloke etmez).
   */
  connect: (token: string): Promise<void> =>
    new Promise(resolve => {
      if (socket?.connected) { resolve(); return; }

      socket = io(SOCKET_URL, {
        auth:          { token },
        transports:    ['websocket'],
        reconnection:  true,
        timeout:       8000,
      });

      socket.on('connect', () => {
        console.log('[Chat] Socket bağlandı:', socket?.id);
        resolve();
      });

      socket.on('disconnect', (reason) => {
        console.log('[Chat] Socket bağlantısı kesildi:', reason);
      });

      socket.on('connect_error', (err) => {
        console.warn('[Chat] Bağlantı hatası:', err.message);
        resolve(); // Hata olsa bile uygulamayı bloke etme
      });
    }),

  /** Belirtilen eşleşme odasına katıl */
  joinRoom: (matchId: string): void => {
    socket?.emit('join_room', { match_id: matchId });
  },

  /** Mesaj gönder */
  sendMessage: (matchId: string, content: string): void => {
    socket?.emit('send_message', { match_id: matchId, content });
  },

  /** Gelen mesajları dinle */
  onMessageReceived: (callback: MessageCallback): void => {
    socket?.off('message_received');   // önceki listener'ı temizle
    socket?.on('message_received', callback);
  },

  /** Odadan ayrıl (ChatScreen unmount'ta) */
  leaveRoom: (matchId: string): void => {
    socket?.emit('leave_room', { match_id: matchId });
    socket?.off('message_received');
  },

  /** Bağlantıyı tamamen kes */
  disconnect: (): void => {
    socket?.disconnect();
    socket = null;
  },

  isConnected: (): boolean => socket?.connected ?? false,
};
