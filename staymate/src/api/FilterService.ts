import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './client';
import type { ApiSuggestion } from './MatchService';
import type { Filters } from '../store';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterOptions {
  city?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  roomTypes?: string[];
  amenities?: string[];
  ageMin?: number | null;
  ageMax?: number | null;
}

// ── Mapping helpers (used by getMatches) ──────────────────────────────────────

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

export class FilterService {
  private STORAGE_KEY = 'discover_filters';
  private DEFAULT_FILTERS: FilterOptions = {
    city:       null,
    priceMin:   null,
    priceMax:   null,
    roomTypes:  [],
    amenities:  [],
    ageMin:     null,
    ageMax:     null,
  };

  // Mevcut filters'ı al
  async getFilters(): Promise<FilterOptions> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      const filters = stored ? JSON.parse(stored) : this.DEFAULT_FILTERS;
      console.log('[FilterService] Loaded filters:', filters);
      return filters;
    } catch (err) {
      console.error('[FilterService] Error loading:', err);
      return this.DEFAULT_FILTERS;
    }
  }

  // Filters'ı kaydet
  async saveFilters(filters: FilterOptions): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
      console.log('[FilterService] Saved filters:', filters);
    } catch (err) {
      console.error('[FilterService] Error saving:', err);
    }
  }

  // Filters'ı sıfırla
  async resetFilters(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('[FilterService] Reset filters');
    } catch (err) {
      console.error('[FilterService] Error resetting:', err);
    }
  }

  // Suggestions'ları filters'a göre filtrele (client-side)
  filterSuggestions(suggestions: any[], filters: FilterOptions): any[] {
    let filtered = [...suggestions];

    if (filters.city) {
      filtered = filtered.filter(s =>
        (s.city || s.profile?.city)?.toLowerCase() === filters.city?.toLowerCase(),
      );
    }

    if (filters.priceMin != null || filters.priceMax != null) {
      filtered = filtered.filter(s => {
        const minPrice   = s.price_min ?? 0;
        const maxPrice   = s.price_max ?? 10000;
        const centerPrice = (minPrice + maxPrice) / 2;
        const min = filters.priceMin ?? 0;
        const max = filters.priceMax ?? 10000;
        return centerPrice >= min && centerPrice <= max;
      });
    }

    if (filters.roomTypes && filters.roomTypes.length > 0) {
      filtered = filtered.filter(s => {
        const roomType = s.room_type || s.profile?.room_type || 'single';
        return filters.roomTypes!.includes(roomType);
      });
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(s => {
        const amenities = s.amenities || s.profile?.amenities || [];
        return filters.amenities!.every(a => amenities.includes(a));
      });
    }

    if (filters.ageMin != null || filters.ageMax != null) {
      filtered = filtered.filter(s => {
        const age = s.age || s.profile?.age || 25;
        const min = filters.ageMin ?? 18;
        const max = filters.ageMax ?? 65;
        return age >= min && age <= max;
      });
    }

    console.log('[FilterService] Filtered:', filtered.length, 'of', suggestions.length);
    return filtered;
  }

  // Filter'ların aktif olup olmadığını kontrol et
  isFiltersActive(filters: FilterOptions): boolean {
    return !!(
      filters.city ||
      filters.priceMin ||
      filters.priceMax ||
      (filters.roomTypes  && filters.roomTypes.length  > 0) ||
      (filters.amenities  && filters.amenities.length  > 0) ||
      filters.ageMin ||
      filters.ageMax
    );
  }

  // Aktif filter sayısını al
  getActiveFilterCount(filters: FilterOptions): number {
    let count = 0;
    if (filters.city)                                        count++;
    if (filters.priceMin || filters.priceMax)                count++;
    if (filters.roomTypes  && filters.roomTypes.length  > 0) count++;
    if (filters.amenities  && filters.amenities.length  > 0) count++;
    if (filters.ageMin     || filters.ageMax)                count++;
    return count;
  }

  // Filtrelenmiş eşleşme önerilerini backend'den getir (FilterScreen kullanır)
  async getMatches(filters: Filters): Promise<ApiSuggestion[]> {
    const params = buildParams(filters);
    const res = await api.get<ApiSuggestion[]>('/matches/suggestions', { params });
    return Array.isArray(res.data) ? res.data : [];
  }
}

export const filterService = new FilterService();
