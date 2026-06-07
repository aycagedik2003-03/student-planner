import api from './client';
import { storage } from '../utils/storage';

// ── Response types ────────────────────────────────────────────────────────────

export type SendCodeResponse = {
  message?: string;
  msg?:     string;
  detail?:  string;
};

export type VerifyEmailResponse = {
  verified?:     boolean;
  isVerified?:   boolean;
  success?:      boolean;
  message?:      string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?:        string;
    email?:     string;
    name?:      string;
    user_type?: string;
    userType?:  string;
  };
};

export type VerificationStatusResponse = {
  isVerified?: boolean;
  verified?:   boolean;
};

// ── Service ───────────────────────────────────────────────────────────────────

export const verificationService = {
  /**
   * Initial send after signup — requires Bearer token from signup response.
   * POST /verify/send   (no body needed; user identified by token)
   */
  sendCode: async (_email?: string): Promise<SendCodeResponse> => {
    const res = await api.post<SendCodeResponse>('/verify/send', {});
    return res.data;
  },

  /**
   * Resend code by email — used when user needs a new code.
   * POST /verify/resend-code  { email }
   */
  resendCode: async (email: string): Promise<SendCodeResponse> => {
    const res = await api.post<SendCodeResponse>('/verify/resend-code', { email });
    return res.data;
  },

  /**
   * Verify the 6-digit code the user entered.
   * POST /verify/verify-email  { code }
   * May return tokens + user on success.
   */
  verifyEmail: async (code: string): Promise<VerifyEmailResponse> => {
    const res = await api.post<VerifyEmailResponse>('/verify/verify-email', { code });
    const data = res.data;

    // If backend returns fresh tokens after verification, persist them
    if (data.access_token) {
      await storage.setItem('userToken', data.access_token);
    }
    if (data.refresh_token) {
      await storage.setItem('refreshToken', data.refresh_token);
    }
    if (data.user?.id) {
      await storage.setItem('userId',   data.user.id);
      await storage.setItem('userType', data.user.user_type ?? data.user.userType ?? 'student');
    }

    return data;
  },

  /**
   * Current user's verification status.
   */
  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    const res = await api.get<VerificationStatusResponse>('/verify/status');
    return res.data;
  },
};

/** Check if the verify response indicates success */
export function isVerifiedResponse(data: VerifyEmailResponse): boolean {
  return data.verified === true || data.isVerified === true || data.success === true;
}
