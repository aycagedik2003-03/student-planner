// Takes t() as a parameter — hooks cannot be called inside plain functions.
export const getErrorMessage = (
  error: any,
  t: (key: string) => string,
): string => {
  // Network error (no response)
  if (!error.response) {
    if (error.message === 'Network Error') return t('errors.checkInternet');
    if (error.code === 'ECONNABORTED')     return t('errors.networkTimeout');
    return t('errors.networkError');
  }

  const status: number      = error.response?.status;
  const data:   any         = error.response?.data;

  if (data?.message) {
    const messageMap: Record<string, string> = {
      'email already exists': t('errors.emailAlreadyExists'),
      'invalid email':        t('errors.invalidEmail'),
      'weak password':        t('errors.weakPassword'),
      'invalid credentials':  t('errors.invalidCredentials'),
      'user not found':       t('errors.userNotFound'),
    };

    const lower = (data.message as string).toLowerCase();
    for (const [fragment, translated] of Object.entries(messageMap)) {
      if (lower.includes(fragment)) return translated;
    }

    return data.message as string;
  }

  switch (status) {
    case 400: return t('errors.invalidFormat');
    case 401: return t('errors.invalidCredentials');
    case 404: return t('errors.userNotFound');
    case 500: return t('errors.serverError');
    default:  return t('errors.unknownError');
  }
};
