# MindCare V2

MindCare is a mental-wellness web application for student wellbeing. The V2 branch uses a Next.js frontend, an Express API, PostgreSQL through Prisma, Supabase Auth, and a separate FastAPI service for AI-assisted conversations.

> **Status: active development / prototype.** V2 includes registered APIs for conversations, chat, moods, resources, journal entries, profile preferences, consent settings, counsellors, and appointments. Automated checks cover backend authentication smoke tests, AI pipeline regression tests, and frontend quality. Database-backed integration, live model-provider behavior, and production readiness still require separate verification.

## Contents

- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Current feature status](#current-feature-status)
- [Repository structure](#repository-structure)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Security and privacy](#security-and-privacy)
- [Development priorities](#development-priorities)
- [Validation checklist](#validation-checklist)

## Architecture

```mermaid
flowchart TD
  U[User browser] --> F[Next.js 16 / React 19]
  F -->|HTTPS + Supabase access token| E[Express 5 API]
  E -->|Prisma queries| DB[(PostgreSQL)]
  E -->|Internal HTTP request| AI[FastAPI AI service]
  AI -->|Configured model request| LLM[OpenRouter]
  S[Supabase Auth] -->|Identity and session verification| F
  S -->|Token verification| E
```

### Responsibility boundaries

- **Next.js / React:** pages, layouts, user interactions, loading/error states, and browser-side API calls.
- **Express:** API contracts, request validation, authentication middleware, application rules, and data/service orchestration.
- **Prisma / PostgreSQL:** durable records for users, conversations, messages, mood logs, AI analysis, and the resource model.
- **Supabase Auth:** identity, email/password or configured OAuth login, and session/token management.
- **FastAPI:** validates chat payloads and runs the AI response pipeline.
- **OpenRouter:** configured model-provider endpoint. Model access never belongs in browser code.

The backend must enforce authorization even when a Next.js page is protected. The AI service is not a replacement for Express authorization. Ordinary mood and dashboard database operations should not call the LLM.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS v4 |
| Frontend auth | Supabase JS and `@supabase/ssr` |
| Backend | Node.js, Express 5 |
| Database access | Prisma 6 |
| Database | PostgreSQL |
| AI API | Python, FastAPI, Pydantic, HTTPX |
| Model provider | OpenRouter |
| Development runner | npm scripts and `concurrently` |

## Current feature status

This status reflects the V2 source tree and registered API routes. It is not a claim that every flow has passed a complete end-to-end or production test.

| Feature | Current implementation status |
|---|---|
| Authentication | Supabase Auth pages/session handling are present; Express verifies bearer tokens and exposes `GET /api/auth/me`. |
| AI chat | `POST /api/chat` forwards a validated request to the separate FastAPI service; persisted messages and analysis are handled by the backend. |
| AI safety pipeline | Risk-aware response routing and response/request validation have regression tests. OpenRouter calls are mocked in CI; live-provider reliability is not established by those tests. |
| Conversation history | Conversation create/list/detail/rename/pin/delete routes are implemented with user-ownership checks. |
| Mood check-ins | Mood create/list/read/update/delete routes are implemented with user-scoped database access. |
| Resource library | Authenticated resource search/category filters and resource detail routes are implemented. Three curated external resources can be loaded by the seed script. |
| Private journal | User-scoped list/search, detail, create, update, and delete routes and a Prisma model/migration are implemented. Test against the configured database before production use. |
| Profile and consents | Profile read/update and consent preference APIs are implemented. Consent defaults are privacy-preserving; saving `share_mood_data` does **not** currently attach mood history to AI requests. |
| Counselling and appointments | Counsellor listing, date-based slot listing, booking, user's appointment list, cancellation, and admin management routes are implemented. The backend includes an atomic slot-claim path to prevent duplicate booking. |
| Demo counsellors | Demo data may be inserted in a development database only. Fictional demo profiles are not verified professionals and must not be used for real counselling. |
| Admin analytics and notifications | Not represented as completed backend features in this version. |
| Onboarding workflow | Some protected-route preparation exists, but a complete onboarding workflow is not implemented. |

A visible page alone does not mean a feature is complete. Verify its API contract, backend validation, permissions, persistence, loading/empty/error states, and database-backed behavior.

## Repository structure

```text
MindCare/
├── AI-Service/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/schemas.py
│   │   ├── prompts/system_prompt.py
│   │   ├── routes/chat.py
│   │   └── services/
│   └── requirements.txt
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── Frontend/
│   ├── src/app/          # route files and layouts
│   ├── src/components/   # app shell, auth, marketing and feature UI
│   ├── src/lib/          # API client, Supabase, config and shared types
│   └── package.json
├── package.json          # starts the three development services
└── README.md
```

The current frontend also contains a `src/features/` directory whose feature subfolders are documentation placeholders. Avoid keeping competing implementations of a feature in both `src/features` and `src/components/features`: consolidate that structure only as part of small, tested refactors.

## Run locally

### Prerequisites

- Node.js 22 LTS recommended.
- Python 3.11 or a compatible Python version for the installed FastAPI dependencies.
- npm.
- A reachable PostgreSQL database and a Supabase project.
- An OpenRouter API key for model-backed chat responses.

### 1. Install dependencies

From the repository root:

```bash
npm install
cd Backend
npm install
cd ../Frontend
npm install
cd ..
```

Create and activate a Python virtual environment, then install the AI dependencies:

**Windows PowerShell**
```powershell
cd AI-Service
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
cd ..
```

**macOS / Linux**
```bash
cd AI-Service
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cd ..
```

### 2. Configure environment files

Create the files described in [Environment variables](#environment-variables). Never copy production secrets into Git.

### 3. Generate the Prisma client and apply migrations

```bash
cd Backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

Run migrations only against the intended development database. Review pending migrations and back up important data before applying schema changes to a shared or production database.

### 4. Start all development services

After the dependencies and environment files are configured, run from the repository root:

```bash
npm run dev
```

The root script starts:
- Frontend: `http://localhost:3000`
- Express API: `http://localhost:5000`
- FastAPI service: `http://127.0.0.1:8000`

Useful health checks:
- Express: `GET http://localhost:5000/health`
- FastAPI: `GET http://127.0.0.1:8000/health`

The AI service exposes `POST /api/v1/chat`; it is intended to be called by Express, not directly by the browser.

## Environment variables

### Frontend — `Frontend/.env.local`

Start from `Frontend/.env.example`.

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The API URL includes the `/api` prefix. Do not add the prefix twice. Configure the Supabase local callback URL, for example `http://localhost:3000/auth/callback`, in the Supabase Auth URL settings.

### Express — `Backend/.env`

Create this file from `Backend/.env.example`.

```dotenv
PORT=5000
FRONTEND_URL=http://localhost:3000
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
AI_SERVICE_URL=http://127.0.0.1:8000
```

Use the connection string required for the configured PostgreSQL/Supabase environment. The current Prisma schema reads the connection from `DIRECT_URL`.

### AI service — `AI-Service/.env`

Start from `AI-Service/.env.example`.

```dotenv
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
```

The AI service currently selects its model in code. Keep the provider key on the server only. Never expose it through a `NEXT_PUBLIC_*` variable or send it to the browser.

## API overview

The Express API uses the `/api` prefix for application routes. Protected routes require a valid Supabase bearer token, except for the health endpoint.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Backend process health |
| GET | `/api/auth/me` | Verify token and return the application user |
| GET, POST | `/api/conversations` | List or create the signed-in user's conversations |
| GET, PATCH, DELETE | `/api/conversations/:conversationId` | Read, rename, or delete an owned conversation |
| PATCH | `/api/conversations/:conversationId/pin` | Pin/unpin an owned conversation |
| POST | `/api/chat` | Process and persist a message and its AI response |
| GET, POST | `/api/moods` | List or create mood check-ins |
| GET, PATCH, DELETE | `/api/moods/:moodId` | Read, update, or delete an owned mood entry |
| GET | `/api/resources?search=&category=` | Search/filter the resource library |
| GET | `/api/resources/:resourceId` | Read one resource |
| GET, POST | `/api/journal` | List/search or create journal entries |
| GET, PUT, DELETE | `/api/journal/:id` | Read, update, or delete an owned journal entry |
| GET, PUT | `/api/profile` | Read/update the signed-in user's editable profile/preferences |
| GET, POST | `/api/consents` | Read or save consent preferences |
| GET | `/api/counsellors` | List active counsellors |
| GET | `/api/counsellors/:id/slots?date=YYYY-MM-DD` | List available slots for a counsellor and date |
| GET, POST | `/api/appointments` | List the user's appointments or book a slot |
| DELETE | `/api/appointments/:appointmentId` | Cancel an owned appointment |
| GET, POST | `/api/admin/counsellors` | Admin: list or create counsellor profiles |
| POST | `/api/admin/counsellors/:counsellorId/slots` | Admin: add availability slots |
| GET | `/api/admin/appointments?status=pending` | Admin: list appointments by status |
| PATCH | `/api/admin/appointments/:appointmentId/status` | Admin: confirm/cancel an appointment |

The separate FastAPI service exposes `POST /api/v1/chat` for internal use by Express. The browser should call Express, not the AI service or OpenRouter directly.

Most Express responses include a `success` field and a `data` object. Check the route/controller schemas for exact request and response fields.

## Security and privacy

- Express verifies the Supabase bearer token on protected endpoints and derives the application user from the verified identity.
- Never use a user ID submitted by the browser as proof of ownership.
- Every read, update, and delete query must scope the record to the authenticated user.
- Do not commit `.env`, `.env.local`, service keys, database passwords, or model-provider secrets.
- Avoid logging mental-wellness messages, journal text, access tokens, or other sensitive contents.
- Keep private journal content out of AI prompts unless a future, explicit consent workflow permits it.
- Treat model-generated risk labels as imperfect signals, not clinical diagnoses or guaranteed risk probabilities.
- MindCare is not a substitute for professional or emergency care.

CORS is a browser-origin policy, not authentication. The API must still verify tokens and enforce record ownership.

## Development priorities

1. **Keep the existing flows stable:** test auth/session expiry, conversation ownership, chat persistence/failure handling, mood CRUD, and dashboard loading.
2. **Strengthen integration testing:** add database-backed tests for journal, resources, profile/consent, and counselling routes, including cross-user access and concurrent slot booking.
3. **Improve AI pipeline behavior:** validate risk routing, model output normalization, timeout/fallback behavior, latency, and prompt/history handling with tests as well as controlled live-provider checks.
4. **Consolidate frontend structure:** keep route files thin, remove duplicate/placeholder implementations, and centralize API/error handling where it reduces real duplication.
5. **Improve observability and resilience:** sanitized logs, timeouts, consistent error contracts, request limits, and useful latency metrics.
6. **Optimize from measurements:** profile requests, Prisma queries, rendering, and bundle size before broad performance changes.

## Validation checklist

Before treating a change as complete:

- [ ] Frontend TypeScript check, lint, and production build pass.
- [ ] Backend smoke tests and AI-service regression tests pass.
- [ ] The configured development database has the committed Prisma migrations applied.
- [ ] Authentication, logout, protected redirects, and expired-token behavior work.
- [ ] A user cannot read or modify another user's conversations, moods, journal entries, profile, or appointments.
- [ ] Chat behavior is checked for successful responses, AI timeouts, provider errors, and persistence failures.
- [ ] Resources load, filter, and open from the authenticated UI.
- [ ] Journal entries can be created, reopened, edited, searched, and deleted.
- [ ] Profile/consent changes persist after a fresh login.
- [ ] Counselling slots can be booked; the same slot cannot be claimed twice; user cancellation and admin status transitions are checked.
- [ ] Non-admin users cannot access admin endpoints.
- [ ] Environment files and secrets are excluded from version control.

CI covers smoke tests, mocked AI pipeline regression tests, frontend type-checking, linting, and a production build. It does not by itself prove full database-backed integration, live OpenRouter behavior, or production readiness.
