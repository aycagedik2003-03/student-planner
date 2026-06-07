import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './client';
import type { Listing, ListingOwner } from '../data/listings';

// ── Existing API types (used by LandlordService.ts) ───────────────────────────

export type ApiListing = {
  id: string;
  title?: string;
  address: string;
  district?: string;
  city?: string;
  price: number;
  rooms: number;
  area?: number;
  photos?: string[];
  furnished?: boolean;
  wifi?: boolean;
  ac?: boolean;
  parking?: boolean;
  elevator?: boolean;
  petsAllowed?: boolean;
  pets_allowed?: boolean;
  description?: string;
  features?: string[];
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

// ── Normalizasyon: ApiListing → yerel Listing tipi ────────────────────────────

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

// ── Landlord listing type (mock CRUD) ─────────────────────────────────────────

export interface LandlordListing {
  id: string;
  title: string;
  description: string;
  city: string;
  address: string;
  price_min: number;
  price_max: number;
  room_type: 'single' | 'double' | 'shared' | 'apartment';
  bedrooms: number;
  bathrooms: number;
  photos: string[];
  amenities: string[];
  rules: string[];
  move_in_date: string;
  contract_length: number;
  created_at: string;
  updated_at: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class ListingService {
  private API_URL = 'https://web-production-63097.up.railway.app/api/v1';
  private STORAGE_KEY = 'listings';
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('userToken');
    }
    return this.token;
  }

  // ── Mock CRUD (AsyncStorage) ─────────────────────────────────────────────────

  async getMyLandlordListings(): Promise<LandlordListing[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      const listings: LandlordListing[] = stored ? JSON.parse(stored) : [];
      console.log('[ListingService] Loaded listings:', listings.length);
      return listings;
    } catch (err) {
      console.error('[ListingService] Error loading:', err);
      return [];
    }
  }

  async getListingById(id: string): Promise<LandlordListing | null> {
    try {
      const listings = await this.getMyLandlordListings();
      return listings.find(l => l.id === id) ?? null;
    } catch (err) {
      console.error('[ListingService] Error:', err);
      return null;
    }
  }

  async saveListing(data: Omit<LandlordListing, 'id' | 'created_at' | 'updated_at'>): Promise<LandlordListing> {
    const newListing: LandlordListing = {
      id:         Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const listings = await this.getMyLandlordListings();
    listings.push(newListing);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(listings));
    console.log('[ListingService] Created listing:', newListing.id);
    return newListing;
  }

  async updateLandlordListing(id: string, data: Partial<LandlordListing>): Promise<LandlordListing | null> {
    try {
      const listings = await this.getMyLandlordListings();
      const index = listings.findIndex(l => l.id === id);
      if (index === -1) return null;
      listings[index] = { ...listings[index], ...data, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(listings));
      console.log('[ListingService] Updated listing:', id);
      return listings[index];
    } catch (err) {
      console.error('[ListingService] Error updating:', err);
      throw err;
    }
  }

  async removeListing(id: string): Promise<boolean> {
    try {
      const listings = await this.getMyLandlordListings();
      const filtered = listings.filter(l => l.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('[ListingService] Deleted listing:', id);
      return true;
    } catch (err) {
      console.error('[ListingService] Error deleting:', err);
      return false;
    }
  }

  async seedMockListings(): Promise<void> {
    const mockListings: LandlordListing[] = [
      {
        id: '1',
        title: 'Güzel Oda, Merkezi Konumda',
        description: 'Temiz, aydınlık oda. Ortak mutfak ve salon. Çok sosyal housemate\'lar.',
        city: 'Poznań',
        address: 'ul. Poznańska 15, Poznań',
        price_min: 1500,
        price_max: 1500,
        room_type: 'single',
        bedrooms: 1,
        bathrooms: 1,
        photos: [],
        amenities: ['WiFi', 'Kitchen', 'Living room', 'Laundry'],
        rules: ['No smoking', 'Quiet hours 22:00-08:00', 'Shared kitchen duties'],
        move_in_date: '2024-06-15',
        contract_length: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockListings));
    console.log('[ListingService] Seeded mock listings');
  }

  async clearAllListings(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    console.log('[ListingService] Cleared all listings');
  }

  // ── API-backed methods (used by existing screens) ────────────────────────────

  async getListings(filters: ListingFilters = {}): Promise<Listing[]> {
    const params: Record<string, unknown> = {};
    if (filters.city)                    params.city      = filters.city;
    if (filters.priceMin)                params.priceMin  = filters.priceMin;
    if (filters.priceMax)                params.priceMax  = filters.priceMax;
    if (filters.rooms)                   params.rooms     = filters.rooms;
    if (filters.furnished !== undefined) params.furnished = filters.furnished;
    const res = await api.get<ApiListing[]>('/listings', { params });
    return (Array.isArray(res.data) ? res.data : []).map(normalizeApiListing);
  }

  async getListingDetail(id: string): Promise<Listing> {
    const res = await api.get<ApiListing>(`/listings/${id}`);
    return normalizeApiListing(res.data);
  }

  // Accepts FormData (existing screens) or a plain object (new mock usage)
  async createListing(data: FormData | Omit<LandlordListing, 'id' | 'created_at' | 'updated_at'>): Promise<any> {
    if (data instanceof FormData) {
      const res = await api.post<ApiListing>('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return normalizeApiListing(res.data);
    }
    return this.saveListing(data);
  }

  async updateListing(id: string, data: Partial<ApiListing>): Promise<Listing> {
    const res = await api.put<ApiListing>(`/listings/${id}`, data);
    return normalizeApiListing(res.data);
  }

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  }

  async getMyListings(): Promise<Listing[]> {
    const res = await api.get<ApiListing[]>('/listings/my');
    return (Array.isArray(res.data) ? res.data : []).map(normalizeApiListing);
  }

  async getListingsByLandlord(landlordId: string): Promise<Listing[]> {
    const res = await api.get<ApiListing[]>('/listings', { params: { landlord_id: landlordId } });
    return (Array.isArray(res.data) ? res.data : []).map(normalizeApiListing);
  }

  async getInterestedStudents(listingId: string): Promise<any[]> {
    const res = await api.get<any[]>(`/listings/${listingId}/interested-students`);
    return Array.isArray(res.data) ? res.data : [];
  }

  async addToFavorites(listingId: string): Promise<{ favorited: boolean }> {
    const res = await api.post<{ favorited: boolean }>(`/listings/${listingId}/favorite`);
    return res.data;
  }

  async addFavorite(listingId: string): Promise<{ favorited: boolean }> {
    return this.addToFavorites(listingId);
  }

  async togglePublish(id: string, published: boolean): Promise<void> {
    await api.patch(`/listings/${id}/publish`, { published });
  }
}

export const listingService = new ListingService();
