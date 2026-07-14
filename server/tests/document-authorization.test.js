import test from "node:test";
import assert from "node:assert/strict";
import { getAuthorizedDocument } from "../services/document-service.js";

function fakeUserClient(result) {
  const query = {
    select() { return this; },
    eq() { return this; },
    async maybeSingle() { return result; },
  };
  return { from: (table) => {
    assert.equal(table, "task_attachments");
    return query;
  } };
}

test("RLS sonucunda görünmeyen dokümanı yetkisiz kullanıcıya açıklamaz", async () => {
  await assert.rejects(
    getAuthorizedDocument("00000000-0000-4000-8000-000000000001", fakeUserClient({ data: null, error: null })),
    (error) => error.status === 404 && error.code === "document_not_found" && /yetkiniz yok/.test(error.message),
  );
});

test("RLS tarafından döndürülen görev dokümanını kabul eder", async () => {
  const document = { id: "doc-1", task_id: "task-1", file_name: "plan.txt" };
  assert.equal(await getAuthorizedDocument(document.id, fakeUserClient({ data: document, error: null })), document);
});
