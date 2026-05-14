export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Şifre boş olamaz');
    return { valid: false, errors };
  }

  if (password.length < 8)      errors.push('Minimum 8 karakter gerekli');
  if (!/[A-Z]/.test(password))  errors.push('En az 1 büyük harf gerekli (A-Z)');
  if (!/[0-9]/.test(password))  errors.push('En az 1 rakam gerekli (0-9)');

  return { valid: errors.length === 0, errors };
};
