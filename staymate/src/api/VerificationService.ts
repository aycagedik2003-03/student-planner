import api from './client';

// ── Response types ────────────────────────────────────────────────────────────

export type SendCodeResponse = {
  message?: string;
  msg?: string;
  detail?: string;
};

export type ConfirmCodeResponse = {
  verified?:    boolean;
  isVerified?:  boolean;
  success?:     boolean;
  message?:     string;
};

export type VerificationStatusResponse = {
  isVerified?: boolean;
  verified?:   boolean;
};

// ── Service ───────────────────────────────────────────────────────────────────

export const verificationService = {
  /**
   * Üniversite e-postasına 6 haneli doğrulama kodu gönderir.
   */
  sendCode: async (email: string): Promise<SendCodeResponse> => {
    const res = await api.post<SendCodeResponse>('/verify/send-code', { email });
    return res.data;
  },

  /**
   * Kullanıcının girdiği kodu doğrular.
   * Başarılıysa `verified: true` döner.
   */
  confirmCode: async (email: string, code: string): Promise<ConfirmCodeResponse> => {
    const res = await api.post<ConfirmCodeResponse>('/verify/confirm-code', { email, code });
    return res.data;
  },

  /**
   * Mevcut kullanıcının doğrulama durumunu getirir.
   */
  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    const res = await api.get<VerificationStatusResponse>('/verify/status');
    return res.data;
  },
};

/** Backend'den gelen ConfirmCodeResponse içinde verified:true var mı kontrol et */
export function isVerifiedResponse(data: ConfirmCodeResponse): boolean {
  return data.verified === true || data.isVerified === true || data.success === true;
}
