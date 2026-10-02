/**
 * Axios adapter that emulates the Click-Star Express API entirely in the
 * browser. Enabled with VITE_API_MODE=mock — used for demos, design QA and
 * frontend work without MongoDB/Cloudinary.
 */
import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getDB, persist } from "./db";
import type { Booking, BookingStatus, LeadStatus, Photographer, Review } from "@/types";

type Handler = (ctx: {
  params: Record<string, string>;
  query: URLSearchParams;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  userId: string | null;
}) => [number, unknown];

const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler; auth?: boolean }[] = [];

const route = (method: string, path: string, handler: Handler, auth = false) => {
  const keys: string[] = [];
  const pattern = new RegExp("^" + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$");
  routes.push({ method, pattern, keys, handler, auth });
};

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const tokenFor = (id: string) => `mock.${btoa(id)}.${Date.now()}`;
const userFromToken = (h?: string) => {
  const t = h?.split(" ")[1];
  if (!t?.startsWith("mock.")) return null;
  try {
    return atob(t.split(".")[1]!);
  } catch {
    return null;
  }
};
const publicUser = (u: { _id: string; name: string; email: string; role: string }) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const party = (id: string) => {
  const u = getDB().users.find((x) => x._id === id);
  return u ? { _id: u._id, name: u.name, email: u.email } : { _id: id, name: "Unknown", email: "" };
};

/* ---------------- auth ---------------- */
route("post", "/auth/register", ({ body }) => {
  const db = getDB();
  const { name, email, password, role = "client" } = body ?? {};
  if (!name || !email || !password) return [400, { message: "Name, email and password are required" }];
  if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return [400, { message: "Email already registered" }];
  const user = { _id: uid("u"), name, email, password, role, createdAt: new Date().toISOString() };
  db.users.push(user);
  if (role === "client") db.clients.push({ _id: uid("c"), userId: user._id, name, email, favorites: [] });
  if (role === "photographer") db.photographers.push({ _id: user._id, name, specialties: [], availability: [], portfolio: [], pricing: { hourly: 0, event: 0, package: 0 } });
  persist();
  return [201, { token: tokenFor(user._id), user: publicUser(user) }];
});

route("post", "/auth/login", ({ body }) => {
  const u = getDB().users.find((x) => x.email.toLowerCase() === String(body?.email ?? "").toLowerCase());
  if (!u || u.password !== body?.password) return [400, { message: "Invalid email or password" }];
  return [200, { token: tokenFor(u._id), user: publicUser(u) }];
});

/* ---------------- photographers ---------------- */
route("get", "/photographer/search", ({ query }) => {
  const location = query.get("location");
  const specialties = query.get("specialties")?.split(",").filter(Boolean);
  let list = getDB().photographers.filter((p) => p.specialties.length > 0);
  if (location) list = list.filter((p) => p.location?.toLowerCase() === location.toLowerCase());
  if (specialties?.length) list = list.filter((p) => p.specialties.some((s) => specialties.includes(s)));
  return [200, list];
});
route("get", "/photographer/profile/:id", ({ params }) => {
  const p = getDB().photographers.find((x) => x._id === params.id);
  return p ? [200, p] : [404, { message: "Profile not found" }];
});
route("get", "/photographer/profile", ({ userId }) => {
  const p = getDB().photographers.find((x) => x._id === userId);
  return p ? [200, p] : [404, { message: "Profile not found" }];
}, true);
route("post", "/photographer/profile", ({ userId, body }) => {
  const db = getDB();
  const i = db.photographers.findIndex((x) => x._id === userId);
  const next = { ...(i >= 0 ? db.photographers[i] : { specialties: [], availability: [] }), ...body, _id: userId } as Photographer;
  if (i >= 0) db.photographers[i] = next;
  else db.photographers.push(next);
  persist();
  return [200, next];
}, true);
route("post", "/photographer/upload", ({ body }) => {
  const files = body instanceof FormData ? (body.getAll("portfolio") as File[]) : [];
  if (!files.length) return [400, { message: "No files uploaded" }];
  return [200, { message: "Files uploaded successfully", portfolioUrls: files.map((f) => URL.createObjectURL(f)) }];
}, true);

/* ---------------- bookings ---------------- */
route("post", "/bookings", ({ body }) => {
  const b: Booking = { _id: uid("b"), status: "pending", createdAt: new Date().toISOString(), ...body };
  getDB().bookings.push(b);
  persist();
  return [201, b];
});
route("get", "/bookings/photographer/:id", ({ params }) => [
  200,
  getDB().bookings.filter((b) => b.photographerId === params.id).map((b) => ({ ...b, clientId: party(b.clientId as string) })),
]);
route("get", "/bookings/client/:id", ({ params }) => [
  200,
  getDB().bookings.filter((b) => b.clientId === params.id).map((b) => ({ ...b, photographerId: party(b.photographerId as string) })),
]);
route("patch", "/bookings/:id/status", ({ params, body }) => {
  const b = getDB().bookings.find((x) => x._id === params.id);
  if (!b) return [404, { message: "Booking not found" }];
  b.status = body.status as BookingStatus;
  persist();
  return [200, b];
});

/* ---------------- reviews ---------------- */
route("post", "/reviews", ({ body }) => {
  if (!body?.rating) return [400, { message: "Rating is required" }];
  const r: Review = { _id: uid("r"), createdAt: new Date().toISOString(), ...body };
  getDB().reviews.push(r);
  persist();
  return [201, r];
});
route("get", "/reviews/:id/rating", ({ params }) => {
  const rs = getDB().reviews.filter((r) => r.photographerId === params.id);
  return [200, { averageRating: rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0, totalReviews: rs.length }];
});
route("get", "/reviews/:id", ({ params }) => [
  200,
  getDB()
    .reviews.filter((r) => r.photographerId === params.id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map((r) => ({ ...r, clientId: { _id: r.clientId as string, name: party(r.clientId as string).name } })),
]);

/* ---------------- clients ---------------- */
const findClient = (userId: string) => getDB().clients.find((c) => c.userId === userId);
route("get", "/client/:userId", ({ params }) => {
  const c = findClient(params.userId!);
  return c ? [200, c] : [404, { message: "Client not found" }];
}, true);
route("put", "/client/:userId", ({ params, body }) => {
  const c = findClient(params.userId!);
  if (!c) return [404, { message: "Client not found" }];
  Object.assign(c, body, { userId: c.userId, _id: c._id });
  persist();
  return [200, c];
}, true);
route("get", "/client/:userId/favorites", ({ params }) => {
  const c = findClient(params.userId!);
  if (!c) return [404, { message: "Client not found" }];
  return [200, getDB().photographers.filter((p) => c.favorites.includes(p._id))];
}, true);
route("post", "/client/:userId/favorites", ({ params, body }) => {
  const c = findClient(params.userId!);
  if (!c) return [404, { message: "Client not found" }];
  if (!c.favorites.includes(body.photographerId)) c.favorites.push(body.photographerId);
  persist();
  return [200, { message: "Added to favorites" }];
}, true);
route("delete", "/client/:userId/favorites/:pid", ({ params }) => {
  const c = findClient(params.userId!);
  if (!c) return [404, { message: "Client not found" }];
  c.favorites = c.favorites.filter((id) => id !== params.pid);
  persist();
  return [200, { message: "Removed from favorites" }];
}, true);

/* ---------------- admin ---------------- */
route("get", "/admin/leads", () => {
  const db = getDB();
  return [
    200,
    db.leads.map((l) => {
      const c = db.clients.find((x) => x._id === l.clientId);
      const p = db.photographers.find((x) => x._id === l.photographerId);
      return {
        ...l,
        clientId: c ? { _id: c._id, name: c.name, email: c.email } : l.clientId,
        photographerId: p ? { _id: p._id, name: p.name, location: p.location } : l.photographerId,
      };
    }),
  ];
}, true);
route("post", "/admin/lead", ({ body }) => {
  const now = new Date().toISOString();
  const l = { _id: uid("l"), status: "pending" as LeadStatus, createdAt: now, updatedAt: now, ...body };
  getDB().leads.push(l);
  persist();
  return [201, l];
}, true);
route("put", "/admin/lead/status", ({ body }) => {
  const l = getDB().leads.find((x) => x._id === body.leadId);
  if (!l) return [404, { message: "Lead not found" }];
  l.status = body.status;
  l.updatedAt = new Date().toISOString();
  persist();
  return [200, l];
}, true);
route("get", "/admin/users", () => [200, getDB().users.map((u) => ({ ...publicUser(u), createdAt: u.createdAt }))], true);

/* ---------------- adapter ---------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await sleep(220 + Math.random() * 380);
  const method = (config.method ?? "get").toLowerCase();
  const base = config.baseURL ?? "";
  const full = new URL((config.url ?? "").startsWith("http") ? config.url! : base.replace(/\/$/, "") + "/" + (config.url ?? "").replace(/^\//, ""), "http://x");
  const path = full.pathname.replace(/^.*?\/api/, "") || "/";
  const query = new URLSearchParams(full.search);
  Object.entries(config.params ?? {}).forEach(([k, v]) => v != null && query.set(k, String(v)));

  let body: unknown = config.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      /* keep string */
    }
  }

  const headers = AxiosHeaders.from(config.headers as never);
  const userId = userFromToken(headers.get("Authorization") as string | undefined);

  const respond = (status: number, data: unknown): AxiosResponse => {
    const res = { data, status, statusText: String(status), headers: {}, config, request: {} } as AxiosResponse;
    if (status >= 400) throw new AxiosError(`Request failed with status code ${status}`, String(status), config, {}, res);
    return res;
  };

  for (const r of routes) {
    if (r.method !== method) continue;
    const m = path.match(r.pattern);
    if (!m) continue;
    if (r.auth && !userId) return respond(403, { message: "No token provided" });
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1]!)]));
    const [status, data] = r.handler({ params, query, body, userId });
    return respond(status, structuredClone(data));
  }
  return respond(404, { message: `No mock route for ${method.toUpperCase()} ${path}` });
}
