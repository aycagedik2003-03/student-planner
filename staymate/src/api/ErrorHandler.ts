// t() is passed as a parameter — hooks cannot be called inside plain functions.
export const getErrorMessage = (
  error: any,
  t: (key: string) => string,
): string => {
  // Network error (no response)
  if (!error.response) {
    if (error.message === 'Network Error') return t('errors.checkInternet');
    if (error.code === 'ECONNABORTED')     return t('errors.networkTimeout');
    return error.message || t('errors.unknownError');
  }

  const status = error.response?.status;
  // FastAPI returns 'detail', not 'message'
  const detail = error.response?.data?.detail || error.response?.data?.message;

  switch (status) {
    case 409: return t('errors.emailAlreadyExists');
    case 400: return detail || t('errors.invalidFormat');
    case 401: return t('errors.invalidCredentials');
    case 404: return detail || t('errors.userNotFound');
    case 500: return t('errors.serverError');
    default:  return detail || t('errors.unknownError');
  }
};
