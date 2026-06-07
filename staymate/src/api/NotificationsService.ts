import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'match_like'
  | 'message'
  | 'profile_view'
  | 'match_mutual'
  | 'listing_view';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  avatar_url?: string | null;
  timestamp: number;
  read: boolean;
  actionId?: string;
  actionType?: 'user' | 'chat' | 'listing';
}

// ── Service ───────────────────────────────────────────────────────────────────

export class NotificationsService {
  private STORAGE_KEY = 'notifications';

  // Seed mock data (runs once)
  async seedMockNotifications(): Promise<void> {
    const exists = await AsyncStorage.getItem(this.STORAGE_KEY);
    if (exists) return;

    const now = Date.now();
    const mock: Notification[] = [
      {
        id: '1',
        type: 'match_like',
        title: 'Anna like Cię',
        description: 'Anna polubił Twój profil',
        avatar_url: null,
        timestamp: now - 5 * 60 * 1000,
        read: false,
        actionId: 'user_1',
        actionType: 'user',
      },
      {
        id: '2',
        type: 'message',
        title: 'Wiadomość od Bartosza',
        description: 'Cześć! Jak się masz?',
        avatar_url: null,
        timestamp: now - 15 * 60 * 1000,
        read: false,
        actionId: 'chat_1',
        actionType: 'chat',
      },
      {
        id: '3',
        type: 'profile_view',
        title: 'Katarzyna obejrzała Twój profil',
        description: 'Katarzyna zainteresowała się Twoim profilem',
        avatar_url: null,
        timestamp: now - 60 * 60 * 1000,
        read: true,
        actionId: 'user_2',
        actionType: 'user',
      },
      {
        id: '4',
        type: 'match_mutual',
        title: 'Nowe dopasowanie!',
        description: 'Ty i Magdalena się polubiliście!',
        avatar_url: null,
        timestamp: now - 3 * 60 * 60 * 1000,
        read: true,
        actionId: 'user_3',
        actionType: 'user',
      },
      {
        id: '5',
        type: 'listing_view',
        title: 'Nowe ogłoszenie: Mieszkanie w Wrocławiu',
        description: 'Nowy pokój dostępny od września',
        avatar_url: null,
        timestamp: now - 24 * 60 * 60 * 1000,
        read: true,
        actionId: 'listing_1',
        actionType: 'listing',
      },
    ];

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(mock));
    console.log('[NotificationsService] Seeded mock notifications');
  }

  // Get all notifications (sorted newest first, seeds if empty)
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        await this.seedMockNotifications();
        return this.getNotifications();
      }
      const list = JSON.parse(data) as Notification[];
      return list.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      console.error('[NotificationsService] Error:', err);
      return [];
    }
  }

  // Mark single notification as read
  async markAsRead(id: string): Promise<void> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[NotificationsService] markAsRead error:', err);
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('[NotificationsService] Marked all as read');
    } catch (err) {
      console.error('[NotificationsService] markAllAsRead error:', err);
    }
  }

  // Delete a single notification
  async deleteNotification(id: string): Promise<void> {
    try {
      const list = await this.getNotifications();
      const updated = list.filter(n => n.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('[NotificationsService] Deleted:', id);
    } catch (err) {
      console.error('[NotificationsService] deleteNotification error:', err);
    }
  }

  // Clear all notifications
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('[NotificationsService] Cleared all');
    } catch (err) {
      console.error('[NotificationsService] clearAll error:', err);
    }
  }

  // Unread count
  async getUnreadCount(): Promise<number> {
    try {
      const list = await this.getNotifications();
      return list.filter(n => !n.read).length;
    } catch (err) {
      console.error('[NotificationsService] getUnreadCount error:', err);
      return 0;
    }
  }

  // Human-readable time ago (language-neutral, locale applied in UI)
  getTimeAgo(timestamp: number): string {
    const diff    = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);

    if (seconds < 60) return 'Właśnie teraz';
    if (minutes < 60) return `${minutes}m temu`;
    if (hours   < 24) return `${hours}h temu`;
    if (days    <  7) return `${days}d temu`;
    return new Date(timestamp).toLocaleDateString('pl-PL');
  }
}

export const notificationsService = new NotificationsService();
