import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { once } from "node:events";

// Fake values initialize auth middleware only; these tests do not connect to Supabase or PostgreSQL.
process.env.SUPABASE_URL ||= "https://mindcare-test.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY ||= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbmRjYXJlLXRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.dGVzdC1zaWduYXR1cmU";
process.env.FRONTEND_URL = "http://localhost:3000";

let server;
let baseUrl;

before(async () => {
  const { default: app } = await import("../src/app.js");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;
  server.close();
  await once(server, "close");
});

test("health endpoint returns healthy status", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("protected API routes reject requests without a bearer token", async () => {
  const sampleId = "b32a5fc0-4df9-4e44-97d4-b729ded8d001";
  const responses = await Promise.all([
    fetch(`${baseUrl}/api/moods`),
    fetch(`${baseUrl}/api/conversations`),
    fetch(`${baseUrl}/api/resources`),
    fetch(`${baseUrl}/api/resources/${sampleId}`),
    fetch(`${baseUrl}/api/journal`),
    fetch(`${baseUrl}/api/journal/${sampleId}`),
    fetch(`${baseUrl}/api/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "private reflection" }),
    }),
    fetch(`${baseUrl}/api/journal/${sampleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "updated reflection" }),
    }),
    fetch(`${baseUrl}/api/journal/${sampleId}`, { method: "DELETE" }),
    fetch(`${baseUrl}/api/profile`),
    fetch(`${baseUrl}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test user" }),
    }),
    fetch(`${baseUrl}/api/consents`),
    fetch(`${baseUrl}/api/consents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission: "notifications", enabled: true }),
    }),
    fetch(`${baseUrl}/api/counsellors`),
    fetch(`${baseUrl}/api/counsellors/${sampleId}/slots?date=2026-11-02`),
    fetch(`${baseUrl}/api/appointments`),
    fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counsellorId: sampleId, startTime: "2026-11-02T10:00:00+05:30" }),
    }),
    fetch(`${baseUrl}/api/appointments/${sampleId}`, { method: "DELETE" }),
    fetch(`${baseUrl}/api/admin/counsellors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test counsellor", isActive: true }),
    }),
    fetch(`${baseUrl}/api/admin/counsellors/${sampleId}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt: "2026-11-02T10:00:00+05:30", endsAt: "2026-11-02T10:30:00+05:30" }),
    }),
    fetch(`${baseUrl}/api/admin/appointments/${sampleId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    }),
    fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: "test", message: "hello" }),
    }),
  ]);

  assert.ok(responses.every((response) => response.status === 401), "every protected endpoint should reject missing bearer tokens");
  const payloads = await Promise.all(responses.map((response) => response.json()));
  assert.ok(payloads.every((payload) => payload.success === false));
});

test("unknown API endpoints return a structured 404 response", async () => {
  const response = await fetch(`${baseUrl}/api/not-implemented`);
  assert.equal(response.status, 404);
  const payload = await response.json();
  assert.equal(payload.success, false);
  assert.match(payload.message, /Route not found/);
});

test("CORS allows the configured Next.js origin", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3000");
});

test("CORS rejects an unapproved browser origin", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).success, false);
});
