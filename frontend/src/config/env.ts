/** Centralised, typed access to build-time configuration. */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:5000/api",
  apiMode: ((import.meta.env.VITE_API_MODE as string | undefined) ?? "live") as "live" | "mock",
  router: ((import.meta.env.VITE_ROUTER as string | undefined) ?? "browser") as "browser" | "hash",
} as const;

export const isMock = env.apiMode === "mock";
