# MindCare V2

MindCare is a mental-wellness web application for student wellbeing. The V2 branch uses a Next.js frontend, an Express API, PostgreSQL through Prisma, Supabase Auth, and a separate FastAPI service for AI-assisted conversations.

> **Status: active development / prototype.** Login, AI chat, mood check-ins, and the dashboard are connected to the current backend paths. Several additional screens are present in the frontend but still need their corresponding backend routes and data models. A successful local demo is not the same as production readiness.

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

This table reflects the source paths and API routes in this branch; it is not a production acceptance test.

| Feature | Current implementation status |
|---|---|
| Login, registration, recovery | Supabase Auth pages and callback are present; Express exposes `GET /api/auth/me` |
| AI chat | Conversation CRUD and `POST /api/chat` are implemented; Express calls FastAPI |
| Conversation history | Stored with Prisma; ownership is checked for conversation operations |
| Mood check-ins | Create, list, retrieve, update, and delete routes are implemented |
| Dashboard | Frontend summary derives information from mood and conversation endpoints |
| Public resources | Public page uses a small curated list of external health-organization links |
| Authenticated resource library | UI calls `/api/resources`, but the current Express app does not register that API |
| Private journal | UI and API helper functions exist; journal routes and a journal Prisma model are not implemented |
| Profile and consent settings | UI/API helper functions exist; profile update and consent routes are not implemented |
| Counselling and bookings | UI/API helper functions exist; counsellor/appointment routes and Prisma models are not implemented |
| Onboarding | Protected-prefix preparation exists, but onboarding state and workflow are not implemented |

Do not treat a feature as complete just because a page is visible. A complete feature needs a real API contract, backend validation, ownership checks, persistence, loading/empty/error states, and tests.

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

The following routes are registered by the current Express application.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Backend process health |
| GET | `/api/auth/me` | Verify the token and return the application user |
| GET, POST | `/api/conversations` | List or create the authenticated user's conversations |
| GET | `/api/conversations/:conversationId` | Get one owned conversation and its messages |
| PATCH | `/api/conversations/:conversationId` | Rename a conversation |
| PATCH | `/api/conversations/:conversationId/pin` | Pin or unpin a conversation |
| DELETE | `/api/conversations/:conversationId` | Delete a conversation |
| POST | `/api/chat` | Process a message for an owned conversation |
| GET, POST | `/api/moods` | List or create mood entries |
| GET, PATCH, DELETE | `/api/moods/:moodId` | Read, update, or delete an owned mood entry |

Successful Express responses use a `success` field and commonly wrap response data in `data`. Chat sends `{ conversationId, message }` and returns persisted user/assistant messages with analysis metadata.

These frontend helpers currently target routes that do not yet exist in Express: `/journal`, `/resources`, `/profile`, `/consents`, `/counsellors`, and `/appointments`. Implement and test each route before advertising those screens as functional.

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

1. **Stabilize the working flows:** automated regression coverage for auth, conversation ownership, chat persistence/failure handling, mood validation, and dashboard loading.
2. **Finish server contracts:** implement journal, resources, profile/consent, and counselling routes and data models—or hide those navigation items until ready.
3. **Consolidate the frontend structure:** keep route files thin, remove placeholder/duplicate organization, and centralize API/error handling without adding unnecessary abstractions.
4. **Improve resilience and observability:** health checks, sanitized logs, timeouts, request limits, error contracts, and structured latency metrics.
5. **Optimize with measurements:** profile repeated requests, database queries, rendering, and bundle size before attempting broad performance changes.
6. **Improve the AI pipeline in a separate phase:** test rule-based risk assessment, model output validation, retrieval grounding, latency, and safe fallback behavior.

## Validation checklist

Before considering a change complete:

- [ ] Frontend type-check, lint, and production build pass.
- [ ] Backend starts, connects to the intended database, and exposes health status.
- [ ] AI service starts and validates its request/response schema.
- [ ] Login, logout, protected redirects, and expired-token handling work.
- [ ] A user cannot read or modify another user's conversations or mood entries.
- [ ] Chat survives provider timeout and persistence failures without misleading orphaned messages.
- [ ] Mood check-ins save and load consistently.
- [ ] Missing backend features are not presented as completed flows.
- [ ] Environment files and secrets are excluded from version control.

Backend API smoke tests use Node's built-in test runner: run `npm test` from `Backend/`. CI also runs frontend type-checking, linting, and a production build. These checks are only a baseline: add database-backed tests for chat persistence, mood CRUD, and cross-user access as those flows are stabilized.
