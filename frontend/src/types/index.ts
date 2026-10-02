// Domain types mirroring the Click-Star Express/Mongoose models.

export type Role = "client" | "photographer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Pricing {
  hourly: number;
  event: number;
  package: number;
}

export interface Photographer {
  _id: string;
  name: string;
  bio?: string;
  location?: string;
  specialties: string[];
  pricing?: Pricing;
  phone?: string;
  website?: string;
  instagram?: string;
  availability: string[];
  /** Optional: not yet persisted by the API — populated by the demo backend. */
  portfolio?: string[];
  coverImage?: string;
  yearsExperience?: number;
  createdAt?: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface PartyRef {
  _id: string;
  name: string;
  email: string;
}

export interface Booking {
  _id: string;
  clientId: string | PartyRef;
  photographerId: string | PartyRef;
  shootDate: string;
  shootType: string;
  location: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  createdAt?: string;
}

export interface NewBooking {
  clientId: string;
  photographerId: string;
  shootDate: string;
  shootType: string;
  location: string;
  price: number;
  notes?: string;
}

export interface Review {
  _id: string;
  clientId: string | { _id: string; name: string };
  photographerId: string;
  rating: number;
  comment?: string;
  bookingId?: string;
  createdAt?: string;
}

export interface NewReview {
  clientId: string;
  photographerId: string;
  rating: number;
  comment?: string;
  bookingId?: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
}

export interface ClientProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  favorites: string[];
}

export type LeadStatus = "pending" | "assigned" | "completed";

export interface Lead {
  _id: string;
  clientId: string | { _id: string; name: string; email: string };
  photographerId: string | { _id: string; name: string; location?: string };
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  location?: string;
  specialties?: string[];
}
