import { useAppStore } from '../store';
import { translations, type Language } from './translations';

export function useTranslation() {
  const language = useAppStore(s => s.language);

  const t = (key: string): string => {
    const parts = key.split('.');
    let value: any = translations[language as Language] ?? translations.tr;

    for (const k of parts) {
      if (value == null) return key;
      value = value[k];
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
