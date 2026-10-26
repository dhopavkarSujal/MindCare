# MindCare frontend — audit, fixes and integration plan

## 1. What the project actually is
The brief describes a Vite app. The supplied `Frontend/` is already **Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind v4 + Supabase SSR**.
No Vite→Next migration is needed; the work is hardening and connecting it to the Express API.

## 2. Route map (after fixes)
| Route | Purpose | Access |
|---|---|---|
| `/`, `/about`, `/resources`, `/privacy`, `/terms` | Marketing + legal placeholders | Public |
| `/login`, `/register`, `/forgot-password` | Auth | Guests (signed-in users are redirected to `?next` or `/dashboard`) |
| `/reset-password`, `/auth/callback` | Recovery + email-verification callback | Public |
| `/dashboard`, `/chat`, `/chat/[id]`, `/mood`, `/journal`, `/counselling`, `/profile`, `/settings`, `/app/resources` | App shell | Signed-in only (proxy + `(app)/layout` `getUser()`) |

## 3. Auth flow
1. Register → `supabase.auth.signUp` (`emailRedirectTo=/auth/callback?next=…`). Session returned → `GET /api/auth/me` → continue. No session → "verify your email" state.
2. Login → `signInWithPassword` → `GET /api/auth/me` (creates/links the Prisma user) → `?next` (validated by `safeInternalPath`) or `/dashboard`.
3. Every API call: `lib/api/client.ts` adds `Authorization: Bearer <access_token>`; a 401 sends the user to `/login?reason=session-expired`.
4. `src/proxy.ts` refreshes cookies and redirects unauthenticated users away from protected prefixes.

## 4. Defects found and fixed
| # | Problem | Fix |
|---|---|---|
| 1 | `src/app/layout.tsx` held auth-layout code: no `<html>/<body>`, fonts or global CSS; imported a CSS path that does not exist | Real root layout: `next/font` Inter + Instrument Serif, global/marketing/features CSS, metadata |
| 2 | `.env` used `NEXT_PUBLIC_API_BASE_URL`, code read `NEXT_PUBLIC_API_URL` → API "not configured" | `lib/config.ts` accepts both; `.env` and `.env.example` corrected |
| 3 | Two `proxy.ts` files (root one ignored because app lives in `src/`); the one in use did **no** route protection | Single `src/proxy.ts` → `updateSession` with protection, `?next`, guest redirect, loop guard |
| 4 | `tsconfig` `baseUrl` is an error on the installed TypeScript | Removed (`paths` works without it) |
| 5 | Chat safety banner looked for `safetyMode/safetyFlag`, which the API never sends | Now uses the real fields: `action === "crisis"`, `riskLevel === "high"`, `analysis.isCrisis` |
| 6 | `reason=session-expired` redirect showed no message | Login shows it |
| 7 | No Terms/Privacy links | Placeholder pages + links (register form, footer); text must come from the institution |
| 8 | Footer anchors (`#faq`…) were dead on non-home pages | Now `/#faq` etc. |
| 9 | Supabase env parsing duplicated in 5 files | `getSupabaseEnv()` |
| 10 | Unused duplicate `src/types/api.ts` | Removed |

## 5. Backend contract vs. frontend
Express exposes only: `/api/auth/me`, `/api/conversations` (+`/:id`, `/:id/pin`), `/api/chat`, `/api/moods` (+`/:id`).

| Frontend page | Backend | Status |
|---|---|---|
| Auth, Chat, Conversations, Mood | exists | **Ready to connect** |
| Dashboard | uses moods + conversations | Ready |
| Journal (`/journal`) | **no route, no Prisma model** | Needs backend work |
| Resources (`/resources`) | Prisma `Resource` model exists, **no route** | Needs a `GET /api/resources` |
| Profile / Settings (`/profile`, `/consents`) | **no routes** | Needs backend work |
| Counselling (`/counsellors`, `/appointments`) | **no routes/models** | Needs backend work or removal from nav |
| Onboarding | no `onboardingCompleted` field | Needs a schema field; not built to avoid fake state |

Until those exist the pages show their real error/empty state — no fake data.

## 6. Blocking items outside the frontend
- **CORS:** `Backend/.env` has `FRONTEND_URL="http://localhost:5173"`. Change to `http://localhost:3000` or every browser call fails.
- **Secret in repo:** `Backend/.env` contains a database password in a plain-text comment (and `.env` files are in the zip). Rotate that password and keep `.env` out of version control.
- **Supabase dashboard:** add `http://localhost:3000/auth/callback` to Redirect URLs (verification + password reset).

## 7. Checks executed in the review environment
- `tsc --noEmit` → pass
- `eslint .` → 0 errors, 10 warnings (`react-hooks/set-state-in-effect`, existing fetch-in-effect pattern, downgraded to warn)
- `next build` → **not run**: `node_modules` was installed on Windows (win32 SWC binaries) and the review environment has no network. Run `npm install && npm run build` locally.
