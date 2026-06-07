import api from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Backend'den gelen öneri kullanıcısı.
 * Field isimleri backend convention'ına göre; eksik alanlar için fallback'ler var.
 */
export type ApiSuggestion = {
  id: string;
  name: string;
  age?: number;
  city?: string;
  university?: string;
  bio?: string;
  /** Backend'den string[] trait key'leri gelir, UI'da icon'a map'lenir */
  traits?: string[];
  /** Uyumluluk puanı — alan adı farklı olabilir */
  compatibilityScore?: number;
  match?: number;
  budget?: number;
  gender?: 'Kadın' | 'Erkek';
  smokes?: boolean;
  alcohol?: 'never' | 'social' | 'regular';
  hasPet?: boolean;
  diet?: 'normal' | 'vegan' | 'vegetarian' | 'halal';
  sleepPattern?: 'night' | 'mid' | 'early';
  cleanlinessRating?: number;
  verified?: boolean;
  avatarUrl?: string | null;
  /** Backend kategori bazlı skor dönerse kullanılır; yoksa genel score fallback */
  compat?: {
    sleep?: number;
    clean?: number;
    social?: number;
    work?: number;
    lifestyle?: number;
  };
};

/** Backend'den gelen aktif eşleşme (konuşma listesi için) */
export type ActiveMatch = {
  id: string;
  /** Bazı API'lar kullanıcıyı doğrudan döner, bazıları nested */
  name?: string;
  avatarUrl?: string | null;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  matchedUser?: {
    id: string;
    name?: string;
    avatarUrl?: string | null;
    city?: string;
  };
};

export type LikeResponse = {
  matched: boolean;
  matchId?: string;
};

// ── Service ───────────────────────────────────────────────────────────────────

export const matchService = {
  /**
   * Mevcut kullanıcıya önerilen profilleri getirir.
   * `filters` opsiyonel query param olarak iletilir.
   */
  getSuggestions: async (
    cityOrFilters?: string | Record<string, any>,
    extraFilters: Record<string, any> = {},
  ): Promise<ApiSuggestion[]> => {
    const filters: Record<string, any> =
      typeof cityOrFilters === 'string'
        ? { city: cityOrFilters, ...extraFilters }
        : (cityOrFilters ?? extraFilters);

    const params = new URLSearchParams();
    if (filters.city)      params.append('city',       String(filters.city));
    if (filters.budgetMin) params.append('budget_min', String(filters.budgetMin));
    if (filters.budgetMax) params.append('budget_max', String(filters.budgetMax));
    if (filters.gender)    params.append('gender',     String(filters.gender));
    if (filters.smoking)   params.append('smoking',    String(filters.smoking));
    if (filters.alcohol)   params.append('alcohol',    String(filters.alcohol));

    if (__DEV__) console.log('[MatchService] Fetching suggestions, params:', Object.fromEntries(params));

    const res = await api.get<ApiSuggestion[]>(`/matches/suggestions?${params.toString()}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Profili beğen.
   * Backend `{ matched: true/false }` döner — true ise karşılıklı eşleşme.
   */
  likeMatch: async (matchId: string): Promise<LikeResponse> => {
    const res = await api.post<LikeResponse>(`/matches/${matchId}/like`);
    return res.data;
  },

  /**
   * Profili geç.
   */
  passMatch: async (matchId: string): Promise<void> => {
    await api.post(`/matches/${matchId}/pass`);
  },

  /**
   * Aktif eşleşmeleri (karşılıklı like'lar) getirir.
   * ChatListScreen için kullanılır.
   */
  getActive: async (): Promise<ActiveMatch[]> => {
    // /matches/active is a student-only endpoint.
    // Landlords don't have matches — skip the call to avoid 401/403.
    const { storage } = await import('../utils/storage');
    const userType = await storage.getItem('userType');
    if (userType === 'landlord') return [];

    const res = await api.get<ActiveMatch[]>('/matches/active');
    return res.data;
  },
};
