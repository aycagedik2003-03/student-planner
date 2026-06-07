import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile }   from '../api/ProfileService';
import type { ApiSuggestion, ActiveMatch } from '../api/MatchService';

const LANG_KEY = '@roomski/language';

// ── Shared types ──────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
};

// ── App types ─────────────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string;
  email?: string;
  quizCompleted: boolean;
  userType: 'student' | 'landlord';
};

export type Filters = {
  city: string | null;
  budgetMin: number;
  budgetMax: number;
  ageMin: number;
  ageMax: number;
  gender: 'Kadın' | 'Erkek' | 'Fark etmez';
  sleepPattern: 'Gece kuşu' | 'Orta' | 'Erken' | 'Fark etmez';
  cleanlinessMin: number;
  smoking: 'İçer' | 'İçmez' | 'Fark etmez';
  alcohol: 'İçer' | 'İçmez' | 'Fark etmez';
  pet: 'Var' | 'Yok' | 'Fark etmez';
  diet: 'Vegan' | 'Vejeteryan' | 'Helal' | 'Normal' | 'Fark etmez';
};

export const DEFAULT_FILTERS: Filters = {
  city: null,
  budgetMin: 500,
  budgetMax: 5000,
  ageMin: 18,
  ageMax: 35,
  gender: 'Fark etmez',
  sleepPattern: 'Fark etmez',
  cleanlinessMin: 0,
  smoking: 'Fark etmez',
  alcohol: 'Fark etmez',
  pet: 'Fark etmez',
  diet: 'Fark etmez',
};

export const isFiltersActive = (f: Filters): boolean =>
  f.city !== null ||
  f.budgetMin !== DEFAULT_FILTERS.budgetMin ||
  f.budgetMax !== DEFAULT_FILTERS.budgetMax ||
  f.ageMin !== DEFAULT_FILTERS.ageMin ||
  f.ageMax !== DEFAULT_FILTERS.ageMax ||
  f.gender !== 'Fark etmez' ||
  f.sleepPattern !== 'Fark etmez' ||
  f.cleanlinessMin > 0 ||
  f.smoking !== 'Fark etmez' ||
  f.alcohol !== 'Fark etmez' ||
  f.pet !== 'Fark etmez' ||
  f.diet !== 'Fark etmez';

export type NotificationPreferences = {
  matches:  boolean;
  messages: boolean;
  listings: boolean;
};

export type NotificationSettings = {
  newMatch:   boolean;
  newMessage: boolean;
  system:     boolean;
};

export type AppSettings = {
  profileHidden: boolean;
};

// ── Store type ────────────────────────────────────────────────────────────────

type AppStore = {
  // ── Auth / token ─────────────────────────────────────────────────────────────
  token: string | null;
  setToken: (token: string | null) => void;

  // ── User ─────────────────────────────────────────────────────────────────────
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  // ── Profile (API'dan gelen tam profil) ───────────────────────────────────────
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  // ── Matches (keşfet önerileri) ────────────────────────────────────────────────
  /** /matches/suggestions'dan gelen ham liste */
  matches: ApiSuggestion[];
  setMatches: (m: ApiSuggestion[]) => void;

  /** /matches/active — karşılıklı eşleşmeler (sohbet listesi) */
  activeMatches: ActiveMatch[];
  setActiveMatches: (m: ActiveMatch[]) => void;

  /**
   * FilterScreen'de API'dan gelen filtrelenmiş öneriler.
   * null → filtre uygulanmadı, MatchScreen tüm önerileri gösterir.
   */
  filteredMatches: ApiSuggestion[] | null;
  setFilteredMatches: (m: ApiSuggestion[]) => void;
  clearFilteredMatches: () => void;

  // ── Messages (matchId → mesaj listesi) ───────────────────────────────────────
  messages: Record<string, ChatMessage[]>;
  /** Bir eşleşmenin tüm mesaj listesini ayarla (ilk yüklemede) */
  setMessages: (matchId: string, msgs: ChatMessage[]) => void;
  /** Tek bir mesaj ekle (socket'ten gelince) */
  addMessage: (matchId: string, msg: ChatMessage) => void;
  /** Belirli bir eşleşmenin mesajlarını getir */
  getMessages: (matchId: string) => ChatMessage[];

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  quizCompleted: boolean;
  setQuizCompleted: (v: boolean) => void;
  quizAnswers: (number | null)[];
  setQuizAnswers: (answers: (number | null)[]) => void;
  quizCity: string | null;
  setQuizCity: (city: string) => void;

  // ── Filters ───────────────────────────────────────────────────────────────────
  filters: Filters;
  setFilters: (f: Filters) => void;
  resetFilters: () => void;

  // ── User type ─────────────────────────────────────────────────────────────────
  userType: 'student' | 'landlord';
  setUserType: (t: 'student' | 'landlord') => void;

  // ── Misc ─────────────────────────────────────────────────────────────────────
  isVerified: boolean;
  setVerified: (v: boolean) => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPref: (key: keyof NotificationPreferences, val: boolean) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSetting: (key: keyof NotificationSettings, val: boolean) => void;
  appSettings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: boolean) => void;
  language: 'tr' | 'pl' | 'en';
  setLanguage: (lang: 'tr' | 'pl' | 'en') => void;
  loadLanguage: () => Promise<void>;
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>((set, get) => ({
  // ── Auth / token ─────────────────────────────────────────────────────────────
  token: null,
  setToken: (token) => set({ token }),

  // ── User ─────────────────────────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, token: null, profile: null, quizCompleted: false }),

  // ── Profile ──────────────────────────────────────────────────────────────────
  profile: null,
  setProfile: (profile) => set({ profile }),

  // ── Matches ───────────────────────────────────────────────────────────────────
  matches: [],
  setMatches: (matches) => set({ matches }),

  activeMatches: [],
  setActiveMatches: (activeMatches) => set({ activeMatches }),

  filteredMatches: null,
  setFilteredMatches: (filteredMatches) => set({ filteredMatches }),
  clearFilteredMatches: () => set({ filteredMatches: null }),

  // ── Messages ──────────────────────────────────────────────────────────────────
  messages: {},
  setMessages: (matchId, msgs) =>
    set(s => ({ messages: { ...s.messages, [matchId]: msgs } })),
  addMessage: (matchId, msg) =>
    set(s => ({
      messages: {
        ...s.messages,
        [matchId]: [...(s.messages[matchId] ?? []), msg],
      },
    })),
  getMessages: (matchId) => get().messages[matchId] ?? [],

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  quizCompleted: false,
  setQuizCompleted: (quizCompleted) => set({ quizCompleted }),
  quizAnswers: [],
  setQuizAnswers: (answers) => set({ quizAnswers: answers }),
  quizCity: null,
  setQuizCity: (city) => set({ quizCity: city }),

  // ── Filters ───────────────────────────────────────────────────────────────────
  filters: { ...DEFAULT_FILTERS },
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // ── User type ─────────────────────────────────────────────────────────────────
  userType: 'student',
  setUserType: (userType) => set({ userType }),

  // ── Misc ─────────────────────────────────────────────────────────────────────
  isVerified: false,
  setVerified: (isVerified) => set({ isVerified }),
  language: 'pl',
  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(LANG_KEY, language).catch(() => {});
  },
  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANG_KEY);
      if (saved === 'tr' || saved === 'pl' || saved === 'en') {
        set({ language: saved });
      }
    } catch {}
  },
  notificationPreferences: { matches: true, messages: true, listings: false },
  notificationSettings: { newMatch: true, newMessage: true, system: true },
  updateNotificationSetting: (key, val) =>
    set((s) => ({
      notificationSettings: { ...s.notificationSettings, [key]: val },
    })),
  updateNotificationPref: (key, val) =>
    set((s) => ({
      notificationPreferences: { ...s.notificationPreferences, [key]: val },
    })),
  appSettings: { profileHidden: false },
  updateSetting: (key, val) =>
    set((s) => ({
      appSettings: { ...s.appSettings, [key]: val },
    })),
}));
