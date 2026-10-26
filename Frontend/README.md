# MindCare V2 — Next.js Frontend

A modular Next.js App Router frontend based on the supplied MindCare V1 source and the `MindCare Research` system architecture. This is a new frontend project; it does not alter the V1 Vite project or any backend files.

## What is included

- Existing botanical-green marketing landing page, retained from the earlier MindCare landing-page package.
- `/about` and a public `/resources` page.
- `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/auth/callback` using Supabase SSR-compatible browser/server clients.
- Protected app layout with responsive sidebar, account menu, and sign-out.
- `/dashboard`: live summary derived from the V1 mood and conversation endpoints, a real mood trend chart, and quick check-in.
- `/chat` and `/chat/[id]`: conversation list, create/rename/delete/pin, messages, a pending/typing state, source links when returned by the API, and a safety banner when the backend returns a safety flag.
- `/mood`: save check-ins, view history/trend, and delete a recorded entry.
- `/journal`: create/edit/delete reflection entries.
- `/app/resources`: search/filter resources provided by the API.
- `/counselling`: counsellor list, live slot lookup, appointment requests, and appointment status/cancellation.
- `/profile` and `/settings`: update profile name and manage consent preferences returned by the backend.
- Shared loading, empty, error, success and responsive states; keyboard focus styling; reduced-motion support.

The UI does not fabricate dashboard metrics, counsellors, appointment availability, user testimonials, or private user activity. API-driven sections show empty/error states when the backend returns no data or is unavailable.

## 1. Requirements

- Node.js 22 LTS recommended.
- A running MindCare Express backend.
- The same Supabase project used by the current V1 frontend.
- The Supabase redirect URLs configured for the V2 origin.

## 2. Environment variables

The uploaded V1 frontend currently uses these Vite variable names:

```dotenv
VITE_API_URL=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Next.js does not expose `VITE_*` environment variables to browser-side code. Create `.env.local` in this project's root and copy the **values** from the V1 `.env` into the corresponding Next.js variable names below. Do not copy secrets into source code or commit `.env.local`.

```dotenv
# Preserve the exact backend base URL/path currently used by VITE_API_URL.
# For example, if V1 uses http://localhost:5000/api, keep /api here.
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Copy the existing values from VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Important notes:

- `NEXT_PUBLIC_API_URL` should be the same base as V1's `VITE_API_URL`. The service helpers append paths such as `/auth/me`, `/moods`, `/conversations`, and `/chat`. If your V1 base already ends with `/api`, do not add `/api` a second time.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key) is the browser publishable key. **Never** put a Supabase service-role key, database password, or OpenRouter/LLM key in a `NEXT_PUBLIC_*` variable.
- `NEXT_PUBLIC_SITE_URL` is used to generate metadata URLs. Set it to the deployed site origin in production.
- The original V1 `.env` is intentionally not included in this package. Keep it unchanged in the V1 folder; create a separate `.env.local` here.

## 3. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For verification before deployment:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

The first production build uses `next/font/google` to fetch/build Instrument Serif and Inter. The build environment therefore needs access to the font source (or the fonts should be migrated to licensed local files with `next/font/local`).

## 4. Supabase redirect configuration

In Supabase Authentication URL configuration, allow the local and production app callback URLs, e.g.:

- `http://localhost:3000/auth/callback`
- `https://YOUR_DEPLOYED_DOMAIN/auth/callback`

Configure your Google provider in Supabase if you want Google sign-in. The redirect URL supplied to Google in its OAuth console is the Supabase provider callback URL shown in your Supabase dashboard, not your MindCare `/auth/callback` route. Test email confirmation and password reset in the actual Supabase project.

## 5. Backend contract compatibility

All data calls go to Express via `NEXT_PUBLIC_API_URL`. The browser client retrieves the Supabase access token and sends `Authorization: Bearer <token>` when present. The Next.js auth proxy refreshes the Supabase SSR session, and protected pages redirect unauthenticated visitors to `/login` with a `next` destination.

### Existing V1 endpoints retained

These paths were present in the uploaded V1 services or page code and were kept the same:

| Feature | Method + path | Request/response expectation |
|---|---|---|
| Backend profile verification | `GET /auth/me` | Expects the V1 shape `data.user` when checking an authenticated profile. |
| Mood check-ins | `GET /moods` | Returns a list (directly or in a `data` wrapper). |
| Mood check-ins | `POST /moods` | `{ score, note? }` |
| Mood entry operations | `GET/PATCH/DELETE /moods/:id` | Used where applicable; update is supported by the helper. |
| Conversations | `GET /conversations` | Returns a conversation list. |
| Conversation details | `GET /conversations/:id` | Includes messages with `sender`/`role` and `text`/`content`. |
| Create conversation | `POST /conversations` | `{ title }`; response must include an `id`. |
| Rename/delete conversation | `PATCH/DELETE /conversations/:id` | Rename body `{ title }`. |
| Pin a conversation | `PATCH /conversations/:id/pin` | `{ isPinned }` |
| Send chat message | `POST /chat` | `{ conversationId, message }`; V1's existing chat page expects a completed JSON response with `aiMessage`. This version preserves that contract and shows a typing state while waiting. |

### Routes based on the MindCare Research document

The V1 ZIP's `journal.service.js` and `resource.service.js` were empty, and its profile/settings/resources pages were placeholders. The following use the architecture report's proposed contracts, so confirm these route names and payloads against the live Express backend before testing those modules end-to-end:

| Feature | Contract used by this frontend |
|---|---|
| Journal | `GET/POST /journal`, `GET/PUT/DELETE /journal/:id`; POST and PUT send `{ content }`; returned entry identifiers can be `entryId` or `id`. |
| Resources | `GET /resources?search=...&category=...`, `GET /resources/:id`; resource links may be `sourceUrl` or `url`. |
| Counselling | `GET /counsellors`, `GET /counsellors/:id/slots?date=YYYY-MM-DD`, `GET/POST /appointments`, `DELETE /appointments/:id`. Booking sends `{ counsellorId, startTime, reason? }`. The backend decides slot availability and appointment status. |
| Profile | `GET /profile`, `PUT /profile` with `{ name? , preferences? }`. |
| Consents | `GET /consents`, `POST /consents` with `{ permission, enabled }`. The settings UI only shows permissions returned by the API. |

If the backend uses different names (for example `/api/journals` or `/api/resources` while your base URL doesn't include `/api`), change the path helpers in `src/lib/api/services.ts` only. Do not scatter route strings through page components.

## 6. Routes and flow

```text
/                       Landing page
/about                  About MindCare
/resources              Public curated resource links
/login                  Supabase sign in
/register               Supabase sign up
/forgot-password        Request a reset email
/auth/callback          Supabase PKCE/email/OAuth callback
/reset-password         Save a new password

Protected after Supabase session check:
/dashboard              Overview and recent mood trend
/chat                   Conversation list
/chat/[id]              Conversation thread
/mood                   Mood check-in and history
/journal                Journal editor and entries
/app/resources          API-backed resource library
/counselling            Counsellors and appointments
/profile                Profile details
/settings               Consent controls
```

## 7. Integration boundaries and safety

- Frontend code talks to Express only; it does not connect to Prisma/PostgreSQL or FastAPI/OpenRouter directly.
- The frontend never accepts a client-provided user ID as proof of identity. Express must verify the Supabase bearer token and derive the user ID server-side.
- The AI chat is not marked as a clinician or emergency service. Safety UI is shown when a safety flag is returned by the backend; the UI must not infer or manufacture a clinical risk classification.
- RAG citations are rendered only when the chat response includes a `sources` array of links. The frontend does not invent citations.
- The public `/resources` page links directly to several established external organisations; `/app/resources` displays resources returned by the MindCare API.
- The app uses the backend response for counsellor availability and booking status. No slot is considered booked until the POST request succeeds.
- No analytics/Sentry integration has been added because credentials and privacy configuration were not supplied. The frontend avoids intentionally logging journal/message content.

## 8. Suggested QA sequence

1. Confirm the landing page opens and the header/footer navigate to `/about`, `/resources`, `/login`, and `/register`.
2. Test registration with the email-confirmation settings actually used by Supabase; confirm the callback returns to the app.
3. Test login, password reset, Google OAuth (if enabled), protected-route redirects, and sign out.
4. Confirm `/auth/me`, `/moods`, `/conversations`, and `/chat` work with the copied API base and bearer token.
5. Confirm journal/resources/counselling/profile/consent route names and payloads against the backend before relying on those screens.
6. Test empty, loading, API-offline, 401, mobile navigation, keyboard focus, and reduced-motion states.
7. Run `npm run typecheck`, `npm run lint`, `npm run build`, then inspect the production build with browser QA/Lighthouse. No Lighthouse/Core Web Vitals score is claimed by this source package.

## Important validation limitation

The Next.js dependencies could not be installed in the packaging environment because `npm install` timed out. The source was syntax-parsed and checked with TypeScript against temporary compatibility declarations plus the existing React/Lucide/Recharts types available in the V1 bundle. A full Next.js production build and real Supabase/Express integration test have **not** been run here; run the commands above in your project environment before deployment.
