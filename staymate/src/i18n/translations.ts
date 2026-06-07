// Source of truth is now src/locales/{tr,pl,en}.json
// This file re-exports the same API that all screens use — no import changes needed.

import trJson from '../locales/tr.json';
import plJson from '../locales/pl.json';
import enJson from '../locales/en.json';

// ── Nested translations (used by useTranslation / t('auth.login') etc.) ──────

export const translations = {
  tr: trJson,
  pl: plJson,
  en: enJson,
} as const;

export type Language = keyof typeof translations;

// ── Flat UI keys (used by useT / t('splash_cta') etc.) ────────────────────────

export type Lang = 'tr' | 'pl' | 'en';

const flat: Record<Lang, Record<string, string>> = {
  tr: trJson.ui as Record<string, string>,
  pl: plJson.ui as Record<string, string>,
  en: enJson.ui as Record<string, string>,
};

export type TKey = keyof typeof flat.en;

// ── Hooks ─────────────────────────────────────────────────────────────────────

import { useAppStore } from '../store';

/** useT — for new design-system screens (flat keys like 'splash_cta') */
export function useT() {
  const language = useAppStore((s) => s.language) as Lang;
  const t = (key: TKey | string): string =>
    flat[language]?.[key as string] ?? flat.en[key as string] ?? String(key);
  return { t, lang: language };
}

/** setLanguage — call from any language switcher */
export function setLanguage(lang: Lang) {
  useAppStore.getState().setLanguage(lang);
}

/** useTranslation — for all existing screens (nested keys like 'auth.login') */
export function useTranslation() {
  const language = useAppStore((s) => s.language) as Lang;

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys  = key.split('.');
    const locale = translations[language] ?? translations.tr;

    let value: unknown = locale;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    // fallback to English
    if (typeof value !== 'string') {
      let fallback: unknown = translations.en;
      for (const k of keys) {
        if (fallback && typeof fallback === 'object') {
          fallback = (fallback as Record<string, unknown>)[k];
        } else {
          fallback = undefined;
          break;
        }
      }
      value = typeof fallback === 'string' ? fallback : key;
    }

    if (typeof value !== 'string') return key;

    // interpolate {0}, {1}, … or {name}
    if (params) {
      Object.entries(params).forEach(([k, val]) => {
        value = (value as string).replace(`{${k}}`, String(val));
      });
    }

    return value as string;
  };

  return { t, language };
}
