import test from "node:test";
import assert from "node:assert/strict";
import { aiRateLimit } from "../middleware/rate-limit.js";

const run = (middleware, request) => {
  let result;
  middleware(request, {}, (error) => { result = error; });
  return result;
};

test("kısa pencere sınırı aşılınca 429 döner", () => {
  const limiter = aiRateLimit({ limit: 2, windowMs: 60_000 });
  const request = { user: { id: "u1" } };
  assert.equal(run(limiter, request), undefined);
  assert.equal(run(limiter, request), undefined);
  assert.equal(run(limiter, request).status, 429);
});

test("farklı limiter'lar sayaç paylaşmaz", () => {
  const first = aiRateLimit({ limit: 1 });
  const second = aiRateLimit({ limit: 1 });
  const request = { user: { id: "u1" } };
  assert.equal(run(first, request), undefined);
  assert.equal(run(second, request), undefined);
});

test("kullanıcılar birbirinden bağımsız sayılır", () => {
  const limiter = aiRateLimit({ limit: 1 });
  assert.equal(run(limiter, { user: { id: "a" } }), undefined);
  assert.equal(run(limiter, { user: { id: "b" } }), undefined);
});

test("günlük kota kısa pencere dolmasa da devreye girer", () => {
  const limiter = aiRateLimit({ limit: 100, windowMs: 60_000, dailyLimit: 3 });
  const request = { user: { id: "u1" } };
  for (let index = 0; index < 3; index += 1) assert.equal(run(limiter, request), undefined);
  const error = run(limiter, request);
  assert.equal(error.status, 429);
  assert.equal(error.code, "daily_quota_exceeded");
});
