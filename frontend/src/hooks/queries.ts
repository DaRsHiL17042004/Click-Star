/** React Query hooks — the only place components touch the service layer. */
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi, bookingApi, clientApi, photographerApi, reviewApi } from "@/services/api";
import type { BookingStatus, LeadStatus, NewBooking, NewReview, Photographer, SearchParams } from "@/types";

export const qk = {
  photographers: (p: SearchParams = {}) => ["photographers", p] as const,
  photographer: (id: string) => ["photographer", id] as const,
  myPhotographer: ["photographer", "me"] as const,
  rating: (id: string) => ["rating", id] as const,
  reviews: (id: string) => ["reviews", id] as const,
  clientBookings: (id: string) => ["bookings", "client", id] as const,
  photographerBookings: (id: string) => ["bookings", "photographer", id] as const,
  client: (id: string) => ["client", id] as const,
  favorites: (id: string) => ["favorites", id] as const,
  leads: ["admin", "leads"] as const,
  users: ["admin", "users"] as const,
};

export const usePhotographers = (params: SearchParams = {}) =>
  useQuery({ queryKey: qk.photographers(params), queryFn: () => photographerApi.search(params), placeholderData: keepPreviousData });

export const usePhotographer = (id?: string) =>
  useQuery({ queryKey: qk.photographer(id ?? ""), queryFn: () => photographerApi.byId(id!), enabled: !!id });

export const useMyPhotographerProfile = (enabled = true) =>
  useQuery({ queryKey: qk.myPhotographer, queryFn: photographerApi.me, enabled, retry: false });

export const useSavePhotographerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Photographer>) => photographerApi.saveProfile(body),
    onSuccess: (p) => {
      qc.setQueryData(qk.myPhotographer, p);
      qc.invalidateQueries({ queryKey: ["photographers"] });
      qc.invalidateQueries({ queryKey: qk.photographer(p._id) });
    },
  });
};

export const useRating = (id?: string) =>
  useQuery({ queryKey: qk.rating(id ?? ""), queryFn: () => reviewApi.rating(id!), enabled: !!id, staleTime: 60_000 });

export const useReviews = (id?: string) =>
  useQuery({ queryKey: qk.reviews(id ?? ""), queryFn: () => reviewApi.forPhotographer(id!), enabled: !!id });

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewReview) => reviewApi.create(body),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: qk.reviews(v.photographerId) });
      qc.invalidateQueries({ queryKey: qk.rating(v.photographerId) });
    },
  });
};

export const useClientBookings = (id?: string) =>
  useQuery({ queryKey: qk.clientBookings(id ?? ""), queryFn: () => bookingApi.forClient(id!), enabled: !!id });

export const usePhotographerBookings = (id?: string) =>
  useQuery({ queryKey: qk.photographerBookings(id ?? ""), queryFn: () => bookingApi.forPhotographer(id!), enabled: !!id });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewBooking) => bookingApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useSetBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => bookingApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useClientProfile = (id?: string) =>
  useQuery({ queryKey: qk.client(id ?? ""), queryFn: () => clientApi.profile(id!), enabled: !!id, retry: false });

export const useUpdateClientProfile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof clientApi.update>[1]) => clientApi.update(id, body),
    onSuccess: (c) => qc.setQueryData(qk.client(id), c),
  });
};

export const useFavorites = (id?: string) =>
  useQuery({ queryKey: qk.favorites(id ?? ""), queryFn: () => clientApi.favorites(id!), enabled: !!id, retry: false });

export const useToggleFavorite = (userId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ photographer, on }: { photographer: Photographer; on: boolean }) =>
      on ? clientApi.addFavorite(userId!, photographer._id) : clientApi.removeFavorite(userId!, photographer._id),
    // Optimistic update so the heart responds instantly.
    onMutate: async ({ photographer, on }) => {
      const key = qk.favorites(userId ?? "");
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Photographer[]>(key);
      qc.setQueryData<Photographer[]>(key, (old = []) => (on ? [...old.filter((p) => p._id !== photographer._id), photographer] : old.filter((p) => p._id !== photographer._id)));
      return { prev, key };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(ctx.key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.favorites(userId ?? "") }),
  });
};

export const useLeads = (enabled = true) => useQuery({ queryKey: qk.leads, queryFn: adminApi.leads, enabled });
export const useUsers = (enabled = true) => useQuery({ queryKey: qk.users, queryFn: adminApi.users, enabled, retry: false });

export const useSetLeadStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => adminApi.setLeadStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leads }),
  });
};

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leads }),
  });
};
