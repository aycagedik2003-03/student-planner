import api from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  name: string;
  email?: string;
  age?: number;
  city?: string;
  university?: string;
  bio?: string;
  /** Trait string dizisi — "Gece kuşu", "Sigara içmez" gibi okunabilir veya snake_case gelebilir */
  traits?: string[];
  avatarUrl?: string;   // camelCase (normalize edilmiş)
  avatar_url?: string;  // snake_case (backend raw)
  quizCompleted?: boolean;
};

export type UpdateProfilePayload = Partial<
  Omit<UserProfile, 'id' | 'email' | 'avatarUrl'>
>;

// ── Service ───────────────────────────────────────────────────────────────────

export const profileService = {
  /**
   * Oturum açmış kullanıcının profilini getirir.
   * Token otomatik olarak client.ts interceptor'ı tarafından eklenir.
   */
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/profile/me');
    return res.data;
  },

  /**
   * Profil bilgilerini günceller.
   */
  updateProfile: async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await api.put<UserProfile>('/profile/me', profileData);
    return res.data;
  },

  /**
   * Avatar yükler — multipart/form-data.
   * React Native'de FormData append'e nesne geçilebilir (Expo destekler).
   */
  uploadAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', {
      uri:  imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const res = await api.post<{ avatarUrl: string }>(
      '/profile/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },
};
