import type { Lang } from './src/i18n/translations';

export type TraitKey =
  | 'gece_kusu' | 'erken_kalkan' | 'gevsek_temizlik' | 'titiz_temizlik'
  | 'sosyal_biri' | 'sessiz_ortam' | 'disarida_icer' | 'evcil_hayvan_yok'
  | 'vegan' | 'sigara_icmez' | 'sigara_icer' | 'ev_yemegi'
  | 'duzenli' | 'rahat' | 'icedonuk' | 'remote' | 'hybrid';

type TraitDef = { emoji: string; tr: string; pl: string; en: string };

export const TRAITS: Record<TraitKey, TraitDef> = {
  gece_kusu:        { emoji: '🦉', tr: 'Gece kuşu',      pl: 'Nocny marek',        en: 'Night owl'       },
  erken_kalkan:     { emoji: '🌅', tr: 'Erken kalkan',   pl: 'Ranny ptaszek',      en: 'Early bird'      },
  gevsek_temizlik:  { emoji: '🧸', tr: 'Rahat temizlik', pl: 'Luzak',              en: 'Relaxed cleaner' },
  titiz_temizlik:   { emoji: '✨', tr: 'Titiz',           pl: 'Dokładny',           en: 'Tidy'            },
  sosyal_biri:      { emoji: '🎉', tr: 'Sosyal',          pl: 'Towarzyski',         en: 'Social'          },
  sessiz_ortam:     { emoji: '🤫', tr: 'Sessiz',          pl: 'Cichy',              en: 'Quiet'           },
  disarida_icer:    { emoji: '🍻', tr: 'Sosyal içici',   pl: 'Pije towarzysko',    en: 'Social drinker'  },
  evcil_hayvan_yok: { emoji: '🚫', tr: 'Evcil hayvan yok', pl: 'Bez zwierząt',   en: 'No pets'         },
  vegan:            { emoji: '🌱', tr: 'Vegan',            pl: 'Vegan',            en: 'Vegan'           },
  sigara_icmez:     { emoji: '🚭', tr: 'Sigara içmez',   pl: 'Niepalący',          en: 'Non-smoker'      },
  sigara_icer:      { emoji: '🚬', tr: 'Sigara içer',    pl: 'Palący',             en: 'Smoker'          },
  ev_yemegi:        { emoji: '🍳', tr: 'Ev yemeği',      pl: 'Gotuje w domu',      en: 'Home cook'       },
  duzenli:          { emoji: '📐', tr: 'Düzenli',         pl: 'Zorganizowany',      en: 'Organised'       },
  rahat:            { emoji: '😌', tr: 'Rahat',           pl: 'Spokojny',           en: 'Laid-back'       },
  icedonuk:         { emoji: '🎧', tr: 'İçe dönük',      pl: 'Introwertyczny',     en: 'Introverted'     },
  remote:           { emoji: '💻', tr: 'Remote',          pl: 'Zdalnie',            en: 'Remote'          },
  hybrid:           { emoji: '🏢', tr: 'Hybrid',          pl: 'Hybrydowo',          en: 'Hybrid'          },
};

export function traitLabel(key: TraitKey, lang: Lang): string {
  return TRAITS[key]?.[lang] ?? TRAITS[key]?.en ?? key;
}
