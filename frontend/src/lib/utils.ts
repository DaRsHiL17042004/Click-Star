import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PartyRef } from "@/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (n: number | undefined | null) => (n == null || Number.isNaN(n) ? "—" : inr.format(n));

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");

/** Many API fields are either an id or a populated document. */
export const refId = (v: string | { _id: string } | undefined | null) => (v == null ? "" : typeof v === "string" ? v : v._id);
export const refName = (v: string | Partial<PartyRef> | undefined | null, fallback = "Unknown") =>
  v && typeof v === "object" && v.name ? v.name : fallback;

export const startingPrice = (p?: { hourly?: number; event?: number; package?: number }) => {
  if (!p) return undefined;
  const vals = [p.hourly, p.event, p.package].filter((x): x is number => typeof x === "number" && x > 0);
  return vals.length ? Math.min(...vals) : undefined;
};

export const errorMessage = (err: unknown, fallback = "Something went wrong. Please try again.") => {
  const e = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } }; message?: string };
  return e?.response?.data?.message || e?.response?.data?.errors?.[0]?.msg || (e?.message && !e.message.startsWith("Request failed") ? e.message : fallback);
};

/** Deterministic hue from a string — used for monogram avatars. */
export const hueFrom = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};
