/**
 * Typed service layer for the Click-Star REST API.
 * Each function maps 1:1 to an Express route in /backend/routes.
 */
import { http } from "@/lib/http";
import type {
  AuthResponse, Booking, BookingStatus, ClientProfile, Lead, LeadStatus, NewBooking, NewReview,
  Photographer, RatingSummary, Review, Role, SearchParams, User,
} from "@/types";

export const authApi = {
  login: (body: { email: string; password: string }) => http.post<AuthResponse>("/auth/login", body).then((r) => r.data),
  register: (body: { name: string; email: string; password: string; role: Role }) =>
    http.post<AuthResponse>("/auth/register", body).then((r) => r.data),
};

export const photographerApi = {
  search: ({ location, specialties }: SearchParams = {}) =>
    http
      .get<Photographer[]>("/photographer/search", {
        params: { location: location || undefined, specialties: specialties?.length ? specialties.join(",") : undefined },
      })
      .then((r) => r.data),
  byId: (id: string) => http.get<Photographer>(`/photographer/profile/${id}`).then((r) => r.data),
  me: () => http.get<Photographer>("/photographer/profile").then((r) => r.data),
  saveProfile: (body: Partial<Photographer>) => http.post<Photographer>("/photographer/profile", body).then((r) => r.data),
  uploadPortfolio: (files: File[], onProgress?: (pct: number) => void) => {
    const form = new FormData();
    files.forEach((f) => form.append("portfolio", f));
    return http
      .post<{ message: string; portfolioUrls: string[] }>("/photographer/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data);
  },
};

export const bookingApi = {
  create: (body: NewBooking) => http.post<Booking>("/bookings", body).then((r) => r.data),
  forPhotographer: (id: string) => http.get<Booking[]>(`/bookings/photographer/${id}`).then((r) => r.data),
  forClient: (id: string) => http.get<Booking[]>(`/bookings/client/${id}`).then((r) => r.data),
  setStatus: (bookingId: string, status: BookingStatus) =>
    http.patch<Booking>(`/bookings/${bookingId}/status`, { status }).then((r) => r.data),
};

export const reviewApi = {
  create: (body: NewReview) => http.post<Review>("/reviews", body).then((r) => r.data),
  forPhotographer: (id: string) => http.get<Review[]>(`/reviews/${id}`).then((r) => r.data),
  rating: (id: string) => http.get<RatingSummary>(`/reviews/${id}/rating`).then((r) => r.data),
};

export const clientApi = {
  profile: (userId: string) => http.get<ClientProfile>(`/client/${userId}`).then((r) => r.data),
  update: (userId: string, body: Partial<ClientProfile>) => http.put<ClientProfile>(`/client/${userId}`, body).then((r) => r.data),
  favorites: (userId: string) => http.get<Photographer[]>(`/client/${userId}/favorites`).then((r) => r.data),
  addFavorite: (userId: string, photographerId: string) =>
    http.post<{ message: string }>(`/client/${userId}/favorites`, { photographerId }).then((r) => r.data),
  removeFavorite: (userId: string, photographerId: string) =>
    http.delete<{ message: string }>(`/client/${userId}/favorites/${photographerId}`).then((r) => r.data),
};

export const adminApi = {
  leads: () => http.get<Lead[]>("/admin/leads").then((r) => r.data),
  createLead: (body: { clientId: string; photographerId: string }) => http.post<Lead>("/admin/lead", body).then((r) => r.data),
  setLeadStatus: (leadId: string, status: LeadStatus) => http.put<Lead>("/admin/lead/status", { leadId, status }).then((r) => r.data),
  /** NOTE: requires a GET /api/admin/users endpoint (not in the API yet). */
  users: () => http.get<(User & { createdAt?: string })[]>("/admin/users").then((r) => r.data),
};
