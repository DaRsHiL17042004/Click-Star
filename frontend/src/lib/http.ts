import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env, isMock } from "@/config/env";

let tokenGetter: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

/** Wired up by <AuthProvider/> so the HTTP layer stays framework-agnostic. */
export const configureAuth = (opts: { getToken: () => string | null; onUnauthorized: () => void }) => {
  tokenGetter = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
};

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
  // In demo mode, requests are served by an in-browser backend (code-split).
  ...(isMock && {
    adapter: async (config: InternalAxiosRequestConfig) => (await import("@/mocks/adapter")).mockAdapter(config),
  }),
});

http.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) onUnauthorized();
    return Promise.reject(error);
  },
);
