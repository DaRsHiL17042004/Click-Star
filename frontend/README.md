# Click-Star — Frontend v2

A ground-up rebuild of the Click-Star web app: a marketplace that connects clients with local photographers across Maharashtra.

**Stack:** Vite 6 · React 19 · TypeScript (strict) · Tailwind CSS 3 · React Router 7 · TanStack Query 5 · React Hook Form + Zod · Framer Motion · Recharts · Lucide

---

## Quick start

```bash
cd frontend
cp .env.example .env        # point VITE_API_BASE_URL at your API
npm install
npm run dev                 # http://localhost:5173
```

### Run without a backend (demo mode)

The app ships with an in-browser mock of the Express API, seeded with photographers, bookings, reviews and leads.

```bash
npm run dev -- --mode demo   # uses .env.demo (VITE_API_MODE=mock, hash routing)
npm run build:demo           # static build you can host anywhere
```

Demo accounts (password `demo1234`): `client@clickstar.in`, `photographer@clickstar.in`, `admin@clickstar.in`.
The mock adapter is code-split, so it never ships in a `live` production build.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run build:demo` | Production build wired to the mock API |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | `tsc` only |

### Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base URL of the Express API |
| `VITE_API_MODE` | `live` | `live` or `mock` |
| `VITE_ROUTER` | `browser` | `browser` (clean URLs, needs SPA fallback) or `hash` |

Never commit `.env` — it's in `.gitignore`. SPA fallbacks are included for Vercel (`vercel.json`) and Netlify (`public/_redirects`).

---

## Architecture

```
src/
  config/env.ts            typed build-time config
  lib/http.ts              axios instance, auth header, 401 handling, mock switch
  services/api.ts          one typed function per Express route
  hooks/queries.ts         React Query hooks (cache keys, invalidation, optimistic favourites)
  context/                 AuthProvider (session), ThemeProvider (light/dark)
  mocks/                   in-browser API (db seed + axios adapter) for demo mode
  components/
    ui/                    design-system primitives (Button, Field, Dialog, Stars, Skeleton…)
    layout/                SiteHeader, SiteFooter
    photographer/          PhotographerCard, FavoriteButton, Lightbox
    brand/Logo.tsx         SVG logo mark + wordmark
  pages/
    Landing, Explore, PhotographerProfile, Booking, Review, Auth, NotFound
    dashboard/             role-based shell → Client, Photographer, Admin views
```

**Principles**

- Components never call axios directly — `services → hooks → components`.
- Every data view has loading skeletons, empty states and error states.
- Forms are validated with Zod schemas and show inline, specific errors.
- Pages are lazy-loaded and recover automatically from stale chunks after a deploy.
- Storage access is wrapped so the app works in private mode and sandboxed iframes.

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | public | Landing page |
| `/photographers` | public | Search & filter (city, specialty, budget, sort) — URL-synced |
| `/photographers/:id` | public | Portfolio, lightbox, packages, availability, reviews |
| `/book/:photographerId` | client | 3-step booking flow |
| `/review/:photographerId/:bookingId` | client | Leave a review |
| `/login`, `/register` | public | Auth (role picker on sign-up) |
| `/dashboard/*` | signed in | Client: overview, bookings, saved, profile · Photographer: overview + revenue chart, bookings (accept/decline/complete), portfolio upload, reviews, studio profile · Admin: overview, leads, users |

Old v1 paths (`/search`, `/client-dashboard`, …) redirect to their v2 equivalents.

## Design system

Concept: **darkroom & contact sheet.** Fibre-paper neutrals, carbon-ink text and one safelight-vermilion accent, with monospace "EXIF" metadata, film-strip framing and crop marks as recurring graphic devices.

- Type: **Zodiak** (display, Fontshare) · **Switzer** (UI/body, Fontshare) · **JetBrains Mono** (metadata)
- Colour tokens live in `src/index.css` as HSL variables with full light and dark themes; Tailwind maps them in `tailwind.config.ts`.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`; visible focus rings; 44px touch targets; skip link.

---

## Backend compatibility notes

The frontend targets the existing Express routes as-is. While wiring it up, these backend issues surfaced — they'll block the live app until fixed:

1. **`controllers/photographer.controller.js`** — every handler declares `const photographer = await photographer.find…`, shadowing the imported model (TDZ `ReferenceError`). Search, profile get/update all fail. Rename the model import (e.g. `Photographer`).
2. **`services/review.service.js`** — `getAverageRating` uses `mongoose` without importing it, and `mongoose.Types.ObjectId(id)` needs `new` in Mongoose 8.
3. **Client profiles** are never created on `/auth/register`, so `/client/:userId` and favourites return 404 for new clients.
4. **Portfolio** — `/photographer/upload` returns URLs but they're not persisted, and the `Photographer` schema has no `portfolio`/`coverImage` fields. The UI sends them via `POST /photographer/profile`; add them to the schema to persist.
5. **Uploads** use `multer.diskStorage('uploads/')` though Cloudinary is configured — the folder doesn't exist and files aren't publicly served.
6. **Missing endpoint** — `GET /api/admin/users` (Admin → Users). The UI shows a clear empty state until it exists.
7. Bookings/reviews routes are unauthenticated; `app.js` requires `body-parser`, which isn't in `package.json`.
