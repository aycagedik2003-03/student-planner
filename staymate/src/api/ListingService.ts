import api from './client';
import type { Listing, ListingOwner } from '../data/listings';

// ── API types (backend response shape) ───────────────────────────────────────

export type ApiListing = {
  id: string;
  title?: string;
  address: string;
  district?: string;
  city?: string;
  price: number;
  rooms: number;
  area?: number;
  photos?: string[];           // gerçek URL'ler veya renk kodları
  furnished?: boolean;
  wifi?: boolean;
  ac?: boolean;
  parking?: boolean;
  elevator?: boolean;
  petsAllowed?: boolean;
  pets_allowed?: boolean;      // snake_case backend alternatifi
  description?: string;
  features?: string[];         // alternatif özellik formatı
  owner?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
    avatar_url?: string;
    matchId?: string;
    match_id?: string;
    rating?: number;
  };
};

export type ListingFilters = {
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  furnished?: boolean;
};

// ── Normalizasyon: ApiListing → yerel Listing tipi ──────────────────────────

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];
function colorFromId(id: string): string {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function normalizeApiListing(raw: ApiListing): Listing {
  const ownerName  = raw.owner?.name ?? 'Ev Sahibi';
  const ownerId    = raw.owner?.id ?? raw.id;
  const matchId    = raw.owner?.matchId ?? raw.owner?.match_id ?? ownerId;

  const owner: ListingOwner = {
    name:        ownerName,
    initial:     ownerName.charAt(0).toUpperCase(),
    avatarColor: colorFromId(ownerId),
    matchId,
  };

  return {
    id:          raw.id,
    photos:      raw.photos && raw.photos.length > 0 ? raw.photos : ['#E6FBFA'],
    address:     raw.title ?? raw.address,
    district:    raw.district ?? '',
    city:        raw.city ?? '',
    price:       raw.price ?? 0,
    rooms:       raw.rooms ?? 1,
    area:        raw.area ?? 0,
    furnished:   raw.furnished ?? false,
    wifi:        raw.wifi ?? false,
    ac:          raw.ac ?? false,
    parking:     raw.parking ?? false,
    elevator:    raw.elevator ?? false,
    petsAllowed: raw.petsAllowed ?? raw.pets_allowed ?? false,
    description: raw.description ?? '',
    owner,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const listingService = {
  /**
   * İlan listesini getirir. Opsiyonel filtreler query param olarak gönderilir.
   */
  getListings: async (filters: ListingFilters = {}): Promise<Listing[]> => {
    const params: Record<string, unknown> = {};
    if (filters.city)      params.city     = filters.city;
    if (filters.priceMin)  params.priceMin = filters.priceMin;
    if (filters.priceMax)  params.priceMax = filters.priceMax;
    if (filters.rooms)     params.rooms    = filters.rooms;
    if (filters.furnished !== undefined) params.furnished = filters.furnished;

    const res = await api.get<ApiListing[]>('/listings', { params });
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(normalizeApiListing);
  },

  /**
   * Tek bir ilanın detayını getirir.
   */
  getListingDetail: async (id: string): Promise<Listing> => {
    const res = await api.get<ApiListing>(`/listings/${id}`);
    return normalizeApiListing(res.data);
  },

  /**
   * Yeni ilan oluşturur — multipart/form-data.
   */
  createListing: async (formData: FormData): Promise<Listing> => {
    const res = await api.post<ApiListing>('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeApiListing(res.data);
  },

  /**
   * Mevcut ilanı günceller.
   */
  updateListing: async (id: string, data: Partial<ApiListing>): Promise<Listing> => {
    const res = await api.put<ApiListing>(`/listings/${id}`, data);
    return normalizeApiListing(res.data);
  },

  /**
   * İlanı siler.
   */
  deleteListing: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
  },

  /**
   * İlanı favorilere ekler/çıkarır.
   */
  addToFavorites: async (listingId: string): Promise<{ favorited: boolean }> => {
    const res = await api.post<{ favorited: boolean }>(`/listings/${listingId}/favorite`);
    return res.data;
  },
};
