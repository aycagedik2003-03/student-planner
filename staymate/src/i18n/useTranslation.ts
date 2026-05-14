import { useAppStore } from '../store';
import { translations } from './translations';

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations] ?? translations.tr;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k as keyof typeof value];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const fk of keys) {
          fallback = fallback?.[fk as keyof typeof fallback];
        }
        value = fallback;
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([k, val]) => {
        value = value.replace(`{${k}}`, String(val));
      });
    }

    return value;
  };

  return { t, language };
};
