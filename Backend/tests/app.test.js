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
  const responses = await Promise.all([
    fetch(`${baseUrl}/api/moods`),
    fetch(`${baseUrl}/api/conversations`),
    fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: "test", message: "hello" }),
    }),
  ]);

  assert.deepEqual(responses.map((response) => response.status), [401, 401, 401]);
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
