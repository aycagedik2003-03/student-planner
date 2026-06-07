export const getErrorMessage = (
  error: any,
  t: (key: string) => string,
  opts?: { isAuthEndpoint?: boolean },
): string => {
  if (!error.response) {
    if (error.message === 'Network Error') return t('errors.checkInternet');
    if (error.code === 'ECONNABORTED')     return t('errors.networkTimeout');
    return error.message || t('errors.unknownError');
  }

  const status = error.response?.status;
  const detail = error.response?.data?.detail || error.response?.data?.message;

  switch (status) {
    case 400: return detail || t('errors.invalidFormat');
    case 401: return t(opts?.isAuthEndpoint ? 'errors.invalidCredentials' : 'errors.tokenExpired');
    case 404: return detail || t('errors.userNotFound');
    case 409: return t('errors.emailAlreadyExists');
    case 500: return t('errors.serverError');
    default:  return detail || t('errors.unknownError');
  }
};
