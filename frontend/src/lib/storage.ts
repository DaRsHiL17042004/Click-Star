/**
 * Storage that never throws. Falls back to memory when Web Storage is
 * unavailable (private mode, sandboxed iframes, SSR).
 */
const memory = new Map<string, string>();

const probe = (): Storage | null => {
  try {
    const s = window.localStorage;
    const k = "__cs_probe__";
    s.setItem(k, k);
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
};

const backend = typeof window !== "undefined" ? probe() : null;

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = backend ? backend.getItem(key) : memory.get(key) ?? null;
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    const raw = JSON.stringify(value);
    try {
      if (backend) backend.setItem(key, raw);
      else memory.set(key, raw);
    } catch {
      memory.set(key, raw);
    }
  },
  remove(key: string) {
    try {
      backend?.removeItem(key);
    } catch {
      /* ignore */
    }
    memory.delete(key);
  },
};
