import test from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";

test("health endpoint'i çalışır ve doküman endpoint'i JWT ister", async (context) => {
  const { createApp } = await import("../app.js");
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  context.after(() => server.close());
  const { port } = server.address();

  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const secured = await fetch(`http://127.0.0.1:${port}/api/documents/00000000-0000-4000-8000-000000000001/status`);
  assert.equal(secured.status, 401);
  const payload = await secured.json();
  assert.equal(payload.error.code, "missing_token");
});
