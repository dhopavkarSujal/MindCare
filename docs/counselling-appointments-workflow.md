# MindCare V2 counselling and appointment workflow

## Workflow

1. Students open `/app/counselling`, browse the five active counsellor profiles, select a date and an available future slot, and submit an optional note. The API creates a `PENDING` appointment.
2. The backend reserves the slot inside a database transaction. A conditional slot claim prevents two requests from claiming the same slot. A student cannot create overlapping pending/confirmed appointments.
3. Admins use `/admin` to review requests and confirm or reject pending appointments. They can publish/hide counsellor listings, link a counsellor login, and add availability.
4. Rejecting or cancelling a future request reopens the slot only if the slot remains active. Appointment rows are retained as history.
5. A counsellor signs in at `/counselor`. The backend resolves the one counsellor profile linked to that authenticated application user and returns only that profile's appointments and future availability.
6. Counsellors can add future availability, remove an unused future slot, and mark a confirmed session completed after its scheduled end time. A slot with a pending or confirmed booking cannot be removed.
7. Students can view appointment outcomes, cancel eligible future bookings, and see cancelled/rejected/completed history. Appointment endpoints never return journals or mood logs.

## Status lifecycle

- `PENDING`: a student requested a slot and the administrator has not decided.
- `CONFIRMED`: the administrator approved the request.
- `REJECTED`: the administrator declined a pending request.
- `CANCELLED`: the student or administrator cancelled a future request/session.
- `COMPLETED`: the assigned counsellor marked the confirmed session completed after its scheduled end.

Closed statuses cannot be reopened. The student must book another available slot.

## Database migration and validation

From `Backend/`, verify that `.env` points at the intended development database, then run:

```bash
npx prisma migrate deploy
npx prisma generate
npm test
```

The migration adds a nullable, unique `Counsellor.userId` relationship and `REJECTED` / `COMPLETED` appointment statuses. It does not delete, reseed, or replace existing counselor data.

## Connect counsellor login accounts

For each counselor:

1. Create/invite a new login from the Supabase Dashboard under Authentication.
2. Copy that Supabase Auth user's UUID.
3. Ensure a corresponding `public."User"` application row exists with `role = 'COUNSELOR'` and `supabaseAuthId` set to the Auth UUID. Use a separate account/email per counselor; do not convert a student account to a counselor account.
4. Sign in as MindCare Admin and open `/admin`. Select the correct counselor account on the matching profile and click **Save account**.
5. Sign in with that counselor login and verify the counselor workspace shows their own schedule.

Use this read-only query to inspect the available counselor application users:

```sql
SELECT id, email, name, role, "supabaseAuthId"
FROM public."User"
WHERE role = 'COUNSELOR'
ORDER BY name;
```

The link endpoint verifies the application role, the Supabase Auth link, and one-to-one profile assignment. It refuses unsafe reassignments while future pending/confirmed appointments remain. Never expose a Supabase service-role key to the frontend.

## Smoke tests

- A student books an available future slot; the appointment becomes pending and the slot cannot be claimed again.
- A second student attempts the same slot and receives a conflict response.
- A student with another pending/confirmed appointment at that time receives a conflict response.
- Admin confirms a pending appointment; the student and assigned counsellor see it.
- Admin rejects a pending appointment; its future active slot becomes available again.
- A student cancels an eligible future appointment; the record remains as cancelled history.
- A counsellor attempts to fetch another counselor's schedule or change an unrelated slot; no unrelated data is returned.
- A counsellor attempts to remove a slot with an active booking; the API returns a conflict.
- A counsellor tries to mark an appointment completed before its scheduled end; the API returns a conflict. After the end time, completion succeeds.
- Journal entries and mood history remain outside the counselor appointment APIs.
