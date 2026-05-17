import api from './client';
import { normalizeApiListing, type ApiListing } from './ListingService';
import type { Listing } from '../data/listings';

export type InterestedStudent = {
  id: string;
  name: string;
  age: number;
  city: string;
  university: string;
  bio: string;
  matchScore: number;
  listingId: string;
  listingTitle: string;
  avatarColor: string;
};

const AVATAR_COLORS = [
  '#00CFC8', '#FF9ACD', '#33D9D3', '#FFA8D4',
  '#C9A8FF', '#7ED4E6', '#98E8C1', '#FFB347',
];
function colorFromId(id: string): string {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

type ApiInterestedStudent = {
  id: string;
  name?: string;
  age?: number;
  city?: string;
  university?: string;
  bio?: string;
  match_score?: number;
  matchScore?: number;
  listing_id?: string;
  listingId?: string;
  listing_title?: string;
  listingTitle?: string;
};

function normalizeStudent(raw: ApiInterestedStudent): InterestedStudent {
  return {
    id:           raw.id,
    name:         raw.name ?? 'Öğrenci',
    age:          raw.age ?? 20,
    city:         raw.city ?? '',
    university:   raw.university ?? '',
    bio:          raw.bio ?? '',
    matchScore:   raw.matchScore ?? raw.match_score ?? 0,
    listingId:    raw.listingId ?? raw.listing_id ?? '',
    listingTitle: raw.listingTitle ?? raw.listing_title ?? '',
    avatarColor:  colorFromId(raw.id),
  };
}

export const landlordService = {
  /** Ev sahibinin kendi ilanlarını getirir */
  getMyListings: async (): Promise<Listing[]> => {
    const res = await api.get<ApiListing[]>('/listings/my');
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(normalizeApiListing);
  },

  /** İlana ilgi gösteren / eşleşen öğrencileri getirir */
  getInterestedStudents: async (listingId?: string): Promise<InterestedStudent[]> => {
    const params = listingId ? { listing_id: listingId } : {};
    const res = await api.get<ApiInterestedStudent[]>('/landlord/interested-students', { params });
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(normalizeStudent);
  },

  /** İlanı yayınla / yayından kaldır */
  togglePublish: async (listingId: string, published: boolean): Promise<void> => {
    await api.patch(`/listings/${listingId}/publish`, { published });
  },

  /** İlanı sil */
  deleteListing: async (listingId: string): Promise<void> => {
    await api.delete(`/listings/${listingId}`);
  },
};
