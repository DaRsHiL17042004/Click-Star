# Click-Star Frontend

The frontend for **Click-Star**, a photography marketplace that helps clients discover local photographers, compare portfolios and pricing, request bookings, save favorites, and leave reviews. Photographers can manage their studio profile, portfolio, availability and bookings. Administrators can review platform leads and user data.

This document explains how to run the frontend, how the files fit together, how requests travel through the application, and what must be checked when connecting it to the live backend.

> **Scope:** This README describes the current frontend structure in `frontend/`. The authentication section also calls out the work required to align the current single-token frontend with the access-token/refresh-token backend design.

## Contents

- [Technology stack](#technology-stack)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [How the application works](#how-the-application-works)
- [File-by-file guide](#file-by-file-guide)
- [Routes and access rules](#routes-and-access-rules)
- [Frontend-to-backend API map](#frontend-to-backend-api-map)
- [Authentication and session handling](#authentication-and-session-handling)
- [Demo mode](#demo-mode)
- [Styling and design system](#styling-and-design-system)
- [Build, deployment and checks](#build-deployment-and-checks)
- [Known integration considerations](#known-integration-considerations)

## Technology stack

- **React** for the component-based UI.
- **TypeScript** with strict compiler settings for application types.
- **Vite** for local development and production builds.
- **React Router** for client-side routing.
- **TanStack Query** for server-state fetching, caching, mutations and cache invalidation.
- **Axios** for HTTP requests.
- **React Hook Form + Zod** for form state and validation.
- **Tailwind CSS** plus custom CSS variables for styling and themes.
- **Framer Motion** for interface animation.
- **Recharts** for dashboard charts.
- **Lucide React** for icons and **Sonner** for toast notifications.

## Run locally

From the repository root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

Before running in live mode, set `VITE_API_BASE_URL` in `.env` to the base URL of the backend you are actually running. The current frontend default is `http://localhost:5000/api`; use the port configured by your backend (for example, `http://localhost:3000/api` if the local backend is listening on port 3000).

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base URL used by Axios. Do not append an endpoint path such as `/auth/login`. |
| `VITE_API_MODE` | `live` | `live` uses the Express API; `mock` uses the in-browser demo API. |
| `VITE_ROUTER` | `browser` | `browser` gives clean URLs; `hash` is useful for static hosting and demo/iframe contexts. |

Vite exposes `VITE_*` variables to browser-side code at build time. Do not put server secrets, signing keys, database credentials or other secrets in frontend environment variables.

Configuration is read in `src/config/env.ts`. `src/lib/http.ts` uses the API URL and mock-mode flag; `src/main.tsx` selects the router based on the configured router mode.

## Project structure

```text
frontend/
├── public/
│   ├── _redirects
│   ├── favicon.svg
│   └── img/                         # Public hero and sample portfolio images
├── src/
│   ├── App.tsx                      # Routes, guards and lazy-loaded pages
│   ├── main.tsx                     # React root and global providers
│   ├── index.css                    # Global CSS, theme tokens and utility classes
│   ├── components/
│   │   ├── brand/Logo.tsx           # Brand icon and wordmark
│   │   ├── layout/                  # Site header and footer
│   │   ├── photographer/            # Cards, favorites and portfolio lightbox
│   │   └── ui/index.tsx              # Shared UI primitives
│   ├── config/env.ts                # Typed build-time environment configuration
│   ├── context/
│   │   ├── auth.tsx                 # Current user/session state and auth actions
│   │   └── theme.tsx                # Light/dark theme state
│   ├── hooks/queries.ts             # TanStack Query hooks and cache behavior
│   ├── lib/
│   │   ├── constants.ts             # Cities, specialties and package definitions
│   │   ├── http.ts                  # Shared Axios client and interceptors
│   │   ├── lazy.ts                  # Lazy-import retry helper
│   │   ├── storage.ts               # Safe browser-storage wrapper
│   │   └── utils.ts                 # Formatting, IDs, errors and class helpers
│   ├── mocks/
│   │   ├── adapter.ts               # Browser-only API emulator
│   │   └── db.ts                    # Seeded demo records and persistence
│   ├── pages/
│   │   ├── Auth.tsx                 # Login and registration
│   │   ├── Booking.tsx              # Three-step booking form
│   │   ├── Explore.tsx              # Photographer directory and filters
│   │   ├── Landing.tsx              # Public home page
│   │   ├── NotFound.tsx             # 404 page
│   │   ├── PhotographerProfile.tsx  # Public photographer details and reviews
│   │   ├── Review.tsx               # Client review form
│   │   └── dashboard/
│   │       ├── index.tsx            # Role-aware dashboard shell and navigation
│   │       ├── shared.tsx           # Shared stats, headings and booking list
│   │       ├── Client.tsx            # Client dashboard pages
│   │       ├── Photographer.tsx      # Photographer dashboard pages
│   │       └── Admin.tsx             # Admin dashboard pages
│   ├── services/api.ts              # Typed API method definitions
│   └── types/index.ts               # Shared domain and response types
├── .env.example
├── .env.demo
├── index.html                       # Browser entry document
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## How the application works

### Normal live request flow

Most data views follow this chain:

```text
Page or component
    ↓
TanStack Query hook (src/hooks/queries.ts)
    ↓
API service method (src/services/api.ts)
    ↓
Shared Axios client (src/lib/http.ts)
    ↓
Express route → middleware/controller/service → database
```

For example, the photographer directory uses `Explore.tsx` → `usePhotographers()` → `photographerApi.search()` → Axios → `GET /api/photographer/search`. TanStack Query stores the result under a query key so other components can reuse it and so mutations can refresh related data.

Authentication state is managed separately by `AuthProvider`, but it configures the HTTP client with a token getter and an unauthorized callback. In demo mode, the HTTP client uses `mocks/adapter.ts` instead of sending requests to the Express server.

### App initialization

1. `index.html` provides the HTML document and the `root` element.
2. `src/main.tsx` mounts React and installs the theme, query, router and authentication providers.
3. `src/App.tsx` decides which page to render from the URL.
4. Pages compose reusable components and query hooks.
5. Data hooks call the typed functions in `src/services/api.ts`.

## File-by-file guide

### Root and build configuration

| File | Responsibility and relationships |
| --- | --- |
| `index.html` | Browser document, metadata, font preconnects/imports, initial theme preference and `#root`. Loads `/src/main.tsx`. |
| `package.json` | Lists dependencies, Node requirement and scripts. npm reads it to install packages and run the app/build/type checks. |
| `package-lock.json` | Locks resolved package versions for reproducible installs. |
| `.env.example` | Template and comments for local environment configuration. Copy to `.env`. |
| `.env.demo` | Enables `VITE_API_MODE=mock` and `VITE_ROUTER=hash` for demo builds. |
| `.gitignore` | Excludes local environment files, `node_modules`, build output and generated files from Git. |
| `vite.config.ts` | Enables React, configures the `@` alias to `src/`, sets the dev port, base path and manual bundle chunks. |
| `tsconfig.json` | Enables strict TypeScript checking and defines the `@/*` path alias. Keep it consistent with Vite's alias. |
| `tailwind.config.ts` | Declares content scanning paths, theme colors backed by CSS variables, fonts, responsive type, shadows and animation. |
| `postcss.config.js` | Runs Tailwind and Autoprefixer as part of CSS processing. |
| `vercel.json` | Configures Vercel's SPA fallback so client-side routes resolve to `index.html`. |
| `README.md` | Project setup, architecture and maintenance documentation. |

### Application and global state

| File | Responsibility and dependencies |
| --- | --- |
| `src/main.tsx` | React entry point. Creates the TanStack Query client and wraps `App` with `ThemeProvider`, `QueryClientProvider`, the selected router and `AuthProvider`; imports `index.css` and configures toast notifications. |
| `src/App.tsx` | Declares top-level routes, lazy-loads page modules, scrolls to the top on path changes, redirects legacy paths and defines `RequireAuth` for signed-in and role-restricted routes. Depends on auth context, the lazy helper and UI spinner. |
| `src/config/env.ts` | Reads `VITE_API_BASE_URL`, `VITE_API_MODE` and `VITE_ROUTER`. Used by the HTTP client and app bootstrap. |
| `src/context/auth.tsx` | Owns the current user/session state and exposes `useAuth()`, `login()`, `register()` and `logout()`. Calls `authApi`, persists the current session using `storage`, and configures the HTTP layer. |
| `src/context/theme.tsx` | Owns the current light/dark theme and exposes `useTheme()`. Updates `data-theme` on the document and the browser theme-color meta tag. Depends on React and the CSS theme variables. |

### HTTP, API services, hooks, types and helpers

| File | Responsibility and dependencies |
| --- | --- |
| `src/lib/http.ts` | Creates the shared Axios instance, applies the API base URL and timeout, adds the bearer token from the configured token getter, invokes the unauthorized callback on HTTP 401, and installs the mock adapter when configured. It is used by every API service. |
| `src/services/api.ts` | Declares typed request methods grouped as `authApi`, `photographerApi`, `bookingApi`, `reviewApi`, `clientApi` and `adminApi`. Uses `http.ts` and the domain types. Normally called by query hooks; auth methods are called from the auth context. |
| `src/hooks/queries.ts` | Wraps API calls in TanStack Query queries/mutations. Defines query keys, loading/error states, cache updates, optimistic favorite toggles and invalidation after changes. Used by public pages and dashboards. |
| `src/types/index.ts` | Shared TypeScript types for roles, users, auth responses, photographers, pricing, bookings, reviews, clients, leads and search parameters. Types describe compile-time data shapes; they do not validate server responses at runtime. |
| `src/lib/storage.ts` | Provides safe `get`, `set` and `remove` methods with localStorage and in-memory fallback. Used for local session persistence and the demo database. It is defensive storage, not a secure token vault. |
| `src/lib/constants.ts` | Central lists of specialties, cities and booking packages. Used by search/filter controls, booking forms and profile editors. |
| `src/lib/lazy.ts` | Wraps `React.lazy()` and attempts one page reload after a failed dynamic import, to recover from stale deployment chunks. Used by `App.tsx` and the dashboard shell. |
| `src/lib/utils.ts` | Reusable utilities: class merging, INR formatting, initials, ID/name handling for populated references, starting price calculation, API error text and deterministic avatar hue. Used across pages and components. |

### Reusable components

| File | Responsibility and relationships |
| --- | --- |
| `src/components/brand/Logo.tsx` | Exports `LogoMark` (SVG icon) and `Logo` (icon plus wordmark). Used in headers, auth pages and dashboards; uses `cn()` for styles. |
| `src/components/layout/SiteHeader.tsx` | Public navigation, theme toggle, sign-in/dashboard/sign-out controls and animated mobile navigation. Depends on React Router, auth/theme contexts, logo and UI components. |
| `src/components/layout/SiteFooter.tsx` | Footer with city links, platform links, contact details and brand information. Used by public pages. |
| `src/components/photographer/PhotographerCard.tsx` | Photographer list card, cover image, specialties, starting price and rating. Also exports `FavoriteButton`, `RatingInline` and `PhotographerCardSkeleton`. Uses query hooks, auth context and utilities. |
| `src/components/photographer/Lightbox.tsx` | Full-screen portfolio viewer with keyboard navigation, previous/next controls and Escape-to-close. Receives images and state callbacks via props; used by `PhotographerProfile.tsx`. |
| `src/components/ui/index.tsx` | Shared design-system primitives: buttons, form controls, fields, badges, cards, skeletons, empty states, avatars, ratings, spinner, dialog and chips. Depends on `lib/utils.ts`, shared types, React and Framer Motion. |

### Public pages

| File | Responsibility and relationships |
| --- | --- |
| `src/pages/Landing.tsx` | Homepage, hero search, category reel, how-it-works content and featured photographers. Uses `usePhotographers()`, photographer cards, header/footer, shared constants and React Router. |
| `src/pages/Explore.tsx` | Photographer directory with URL-backed city/specialty/budget filters, text search and sorting. Calls `usePhotographers()` and renders loading, error and empty states. |
| `src/pages/PhotographerProfile.tsx` | Loads a photographer by route ID and renders portfolio, biography, contacts, packages, availability, reviews and rating breakdown. Uses `usePhotographer()`, `useRating()`, `useReviews()`, `FavoriteButton` and `Lightbox`. |
| `src/pages/Auth.tsx` | Exports `Login` and `Register`. Uses React Hook Form and Zod, calls auth context methods, displays validation/API errors, supports mock demo accounts, and navigates after successful login/registration. |
| `src/pages/Booking.tsx` | Three-step booking request form. Loads the photographer, calculates the UI estimate and submits via `useCreateBooking()`. Uses auth context, package/specialty constants, date-fns and shared form components. The backend must validate identity, package and price independently. |
| `src/pages/Review.tsx` | Client rating/comment form. Loads the photographer and submits through `useCreateReview()`. The backend must validate the booking's ownership/completion and duplicate-review rules. |
| `src/pages/NotFound.tsx` | 404 page with links to the homepage and photographer directory. |

### Dashboard pages

| File | Responsibility and relationships |
| --- | --- |
| `src/pages/dashboard/index.tsx` | Dashboard shell. Builds different navigation menus for client, photographer and admin roles and renders the correct role dashboard. Uses `useAuth()`, shared UI and lazy loading. |
| `src/pages/dashboard/shared.tsx` | Shared `PageHeader`, `Stat` and `BookingList`. `BookingList` sorts/filters bookings and offers role-specific status actions using `useSetBookingStatus()`. |
| `src/pages/dashboard/Client.tsx` | Client overview, booking list, favorites and profile editor. Uses auth state plus client booking/profile/favorite hooks and shared dashboard components. |
| `src/pages/dashboard/Photographer.tsx` | Photographer overview and revenue chart, booking management, portfolio uploads and edits, review display, studio profile/pricing/contact editor and availability dates. Uses photographer/review/booking hooks, `photographerApi.uploadPortfolio()`, Recharts, forms and shared dashboard UI. |
| `src/pages/dashboard/Admin.tsx` | Admin overview, leads list/status editor and users list with filtering. Uses lead/user/photographer hooks and Recharts. The users view depends on `GET /api/admin/users` being available on the running backend. |

### Demo/mock backend

| File | Responsibility and relationships |
| --- | --- |
| `src/mocks/db.ts` | Defines the mock database shape, seeds users/photographers/clients/bookings/reviews/leads and persists it through `storage.ts` under `clickstar.mockdb.v1`. |
| `src/mocks/adapter.ts` | Implements an Axios adapter that parses requests, matches mock route handlers and reads/writes the mock database. Used only when `VITE_API_MODE=mock`. It emulates API behavior for demos; it is not a substitute for backend security or integration testing. |

### Public files

| File or group | Responsibility |
| --- | --- |
| `public/favicon.svg` | Browser tab icon. |
| `public/_redirects` | SPA fallback rule for hosts supporting Netlify-style redirects. |
| `public/img/*.webp` | Static hero and sample photography images referenced by the landing/auth UI and mock seed data. |

## Routes and access rules

| Path | Page | Frontend access rule |
| --- | --- | --- |
| `/` | Landing | Public |
| `/photographers` | Explore | Public |
| `/photographers/:id` | Photographer profile | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public; user can choose client or photographer |
| `/book/:photographerId` | Booking | Client role required |
| `/review/:photographerId/:bookingId` | Review | Client role required |
| `/dashboard/*` | Role dashboard | Any signed-in user; nested dashboard chooses content by role |
| `/search` | Redirect to `/photographers` | Public legacy redirect |
| `/client-dashboard/*` | Redirect to `/dashboard` | Public legacy redirect |
| `/photographer-dashboard/*` | Redirect to `/dashboard` | Public legacy redirect |
| `/admin-dashboard/*` | Redirect to `/dashboard` | Public legacy redirect |
| `*` | Not found | Public fallback |

The role checks in React are navigation and user-experience controls. They must always be paired with backend authentication, authorization, and ownership checks on protected APIs.

## Frontend-to-backend API map

The current service layer calls these route families (the configured API base URL already includes `/api`):

| Service | HTTP route | Purpose |
| --- | --- | --- |
| `authApi` | `POST /auth/login` | Sign in a user |
| `authApi` | `POST /auth/register` | Register a client or photographer |
| `photographerApi` | `GET /photographer/search` | Search photographers by location and specialties |
| `photographerApi` | `GET /photographer/profile/:id` | Get a public photographer profile |
| `photographerApi` | `GET /photographer/profile` | Get the signed-in photographer's profile |
| `photographerApi` | `POST /photographer/profile` | Create/update the signed-in photographer's profile |
| `photographerApi` | `POST /photographer/upload` | Upload portfolio files |
| `bookingApi` | `POST /bookings` | Create a booking request |
| `bookingApi` | `GET /bookings/client/:id` | List a client's bookings |
| `bookingApi` | `GET /bookings/photographer/:id` | List a photographer's bookings |
| `bookingApi` | `PATCH /bookings/:id/status` | Change a booking's status |
| `reviewApi` | `POST /reviews` | Create a review |
| `reviewApi` | `GET /reviews/:id` | List a photographer's reviews |
| `reviewApi` | `GET /reviews/:id/rating` | Retrieve average rating and count |
| `clientApi` | `GET /client/:userId` | Get client profile |
| `clientApi` | `PUT /client/:userId` | Update client profile |
| `clientApi` | `GET /client/:userId/favorites` | List favorite photographers |
| `clientApi` | `POST /client/:userId/favorites` | Add a favorite photographer |
| `clientApi` | `DELETE /client/:userId/favorites/:photographerId` | Remove a favorite photographer |
| `adminApi` | `GET /admin/leads` | List leads |
| `adminApi` | `POST /admin/lead` | Create a lead |
| `adminApi` | `PUT /admin/lead/status` | Update lead status |
| `adminApi` | `GET /admin/users` | List user records for admin screens |

Always compare this list against the backend actually deployed or running locally. A route present in the repository may not be present in another backend instance, and a successful mock response does not prove live compatibility.

## Authentication and session handling

### Current implementation

- `AuthProvider` stores the user and token in React state and persists the complete session using `src/lib/storage.ts`.
- `authApi.login()` and `authApi.register()` send requests to the centralized `/auth/login` and `/auth/register` endpoints.
- `src/lib/http.ts` adds `Authorization: Bearer <token>` when the token getter returns a value.
- The HTTP response interceptor calls the configured unauthorized callback on any `401` response.
- The current `logout()` clears local state and the React Query cache, but does not call a server logout/revocation endpoint.
- There are currently no `authApi.refresh()` or `authApi.logout()` methods, and the Axios instance does not set `withCredentials: true`.

### Alignment needed for an access-token/refresh-token backend

If the backend uses a short-lived access token in JSON and an HttpOnly refresh-token cookie, coordinate these files together:

1. **`src/types/index.ts`:** define the exact backend auth response shape, preferably using `accessToken` instead of relying on a temporary `token` alias.
2. **`src/services/api.ts`:** add typed refresh and logout methods that match the real backend routes.
3. **`src/lib/http.ts`:** enable cookie credentials where required, refresh on an expired-access-token response, prevent multiple parallel refreshes, retry the failed request only once, and avoid refresh recursion. Do not log out on every `401` before attempting refresh.
4. **`src/context/auth.tsx`:** keep the access token in memory, establish/restablish the session through the refresh endpoint at startup when appropriate, and perform server-side logout/revocation before clearing local state.
5. **Backend CORS/cookies:** when frontend and backend are on different origins, configure an explicit allowed frontend origin, credentials support and cookie attributes appropriate to the deployment (including HTTPS/SameSite rules).

Do not store the refresh token in localStorage or JavaScript-readable browser storage. The HttpOnly cookie should be managed by the browser and backend. Frontend route guards are not security boundaries; the server must verify the access token and enforce role/ownership checks for every protected operation.

For a multi-device session policy, the frontend should revoke the current session on logout according to the backend contract, rather than assuming that every logout invalidates all devices.

## Demo mode

The frontend includes a fully in-browser mock API. Start it with:

```bash
npm run dev -- --mode demo
```

Build a static demo with:

```bash
npm run build:demo
```

Demo users use password `demo1234`:

- `client@clickstar.in`
- `photographer@clickstar.in`
- `admin@clickstar.in`

`src/mocks/db.ts` holds the seeded data and persists changes in browser storage. `src/mocks/adapter.ts` acts as the mock API, simulating requests without Express, MongoDB or the actual upload service.

**Important:** demo mode is for UI review and development only. Its token and authorization simulation are not equivalent to production JWT verification and backend authorization. Always test real login, token expiration, refresh, logout, role restrictions and data ownership against the live backend too.

## Styling and design system

The design direction is **darkroom and contact sheet**: paper-like surfaces, dark ink, a warm vermilion accent, display typography and small monospace metadata.

- `src/index.css` defines theme variables and global/component CSS.
- `tailwind.config.ts` maps Tailwind color names to those variables and defines fonts, responsive type sizes, borders, shadows and animations.
- `components/ui/index.tsx` is the reusable UI primitive library.
- `components/brand/Logo.tsx` contains the SVG mark and wordmark.
- `context/theme.tsx` updates `data-theme` for light/dark mode.
- `index.html` loads the Zodiak, Switzer and JetBrains Mono fonts from external font providers.

The stylesheet includes reduced-motion support and visible focus styling. Keep new components aligned with existing tokens and primitives where practical rather than introducing duplicate styles.

## Build, deployment and checks

```bash
npm run dev          # Start the local Vite server
npm run build        # Type-check and make the live production build
npm run build:demo   # Type-check and make the mock/demo build
npm run preview      # Serve the built dist/ directory locally
npm run typecheck    # Run TypeScript checks only
```

`npm run build` runs `tsc -b` before `vite build`. The project currently does not declare a dedicated frontend test script, so type-checking/build success does not replace route/API integration tests.

For browser-based history routing (`VITE_ROUTER=browser`), production hosting must return `index.html` for valid frontend paths. The repository includes `vercel.json` and `public/_redirects` for SPA fallback support on the relevant hosting platforms.

## Known integration considerations

Review these points when validating a live backend integration:

1. **API URL:** the frontend default is `http://localhost:5000/api`. Change it to the actual backend URL/port before testing.
2. **Auth response shape:** the current frontend type expects `{ token, user }`; the newer access-token flow should explicitly use the agreed `{ accessToken, user }` contract.
3. **Refresh and logout:** automatic refresh, refresh-cookie credential handling and backend logout/revocation are not implemented in the current frontend.
4. **Token persistence:** the current auth context saves the token with the rest of the session in browser storage. This should be changed for the planned memory-only access token plus HttpOnly refresh cookie model.
5. **Price validation:** booking price is calculated by the browser and included in the request. The backend must validate the chosen package and authoritative price; never trust client-submitted price as proof of the payable amount.
6. **Role and ownership checks:** all privileged requests must be verified by the server. This includes bookings, client profile/favorites, photographer profile changes, review eligibility and admin operations.
7. **Admin users screen:** the frontend uses `GET /admin/users`. If the running backend does not implement that endpoint, the page will show an error state even though the UI is present.
8. **Demo mode limitations:** mock endpoints do not reproduce all production authentication and ownership rules.
9. **Portfolio object URLs:** the photographer uploader creates temporary browser object URLs for selected files. Revoke URLs when previews are discarded or no longer needed to avoid unnecessary memory use.
10. **Dashboard revenue chart:** the current chart sums non-cancelled bookings by shoot date, so pending or unconfirmed amounts can be included. Confirm the intended business definition of revenue and adjust the calculation if it should represent completed/paid work only.
11. **Error and empty states:** most data-heavy views provide loading/error/empty states. When adding pages, preserve these states so network failure does not look like an empty dataset.
12. **Documentation drift:** verify backend compatibility notes against the exact server version being run. A route or model fix in one working copy may not have reached the deployed server.

## Recommended workflow for new features

1. Add or confirm the backend endpoint and its request/response contract.
2. Add/update the shared TypeScript type in `src/types/index.ts`.
3. Add a typed API method in `src/services/api.ts`.
4. Add a query or mutation hook in `src/hooks/queries.ts`, including cache invalidation where necessary.
5. Build the page/component using existing UI primitives and handle loading, error and empty states.
6. Verify role restrictions and data ownership on the backend.
7. Test the feature in live mode; use mock mode for UI iteration, not as proof of production security.
8. Run `npm run typecheck` and `npm run build` before committing.
