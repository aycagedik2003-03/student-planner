import api from './client';
import type { ApiSuggestion } from './MatchService';
import type { Filters } from '../store';

// ── Mapping helpers ───────────────────────────────────────────────────────────

const GENDER_MAP: Record<string, string> = {
  'Kadın': 'Kadın',
  'Erkek': 'Erkek',
};

const SLEEP_MAP: Record<string, string> = {
  'Gece kuşu': 'night',
  'Orta':      'mid',
  'Erken':     'early',
};

const DIET_MAP: Record<string, string> = {
  'Vegan':      'vegan',
  'Vejeteryan': 'vegetarian',
  'Helal':      'halal',
  'Normal':     'normal',
};

/**
 * Store `Filters` → backend query params.
 * "Fark etmez" ve sıfır değerler atlanır (backend default davranışı tetikler).
 */
function buildParams(filters: Filters): Record<string, unknown> {
  const p: Record<string, unknown> = {};

  if (filters.city) p.city = filters.city;

  p.budgetMin = filters.budgetMin;
  p.budgetMax = filters.budgetMax;
  p.age_min   = filters.ageMin;
  p.age_max   = filters.ageMax;

  if (filters.gender !== 'Fark etmez') {
    p.gender = GENDER_MAP[filters.gender] ?? filters.gender;
  }

  if (filters.sleepPattern !== 'Fark etmez') {
    p.sleepPattern = SLEEP_MAP[filters.sleepPattern] ?? filters.sleepPattern;
  }

  if (filters.cleanlinessMin > 0) {
    p.cleanlinessMin = filters.cleanlinessMin;
  }

  if (filters.smoking === 'İçer')  p.smoking = true;
  if (filters.smoking === 'İçmez') p.smoking = false;

  if (filters.alcohol === 'İçer')  p.alcohol = 'social';
  if (filters.alcohol === 'İçmez') p.alcohol = 'never';

  if (filters.pet === 'Var') p.pets = true;
  if (filters.pet === 'Yok') p.pets = false;

  if (filters.diet !== 'Fark etmez') {
    p.diet = DIET_MAP[filters.diet] ?? filters.diet;
  }

  return p;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const filterService = {
  /**
   * Filtrelenmiş eşleşme önerilerini getirir.
   * Filtreler API'ye query param olarak gönderilir.
   */
  getMatches: async (filters: Filters): Promise<ApiSuggestion[]> => {
    const params = buildParams(filters);
    const res = await api.get<ApiSuggestion[]>('/matches/suggestions', { params });
    return Array.isArray(res.data) ? res.data : [];
  },
};
