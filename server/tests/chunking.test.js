import test from "node:test";
import assert from "node:assert/strict";
import { chunkDocument } from "../services/chunking.js";

test("uzun metni sıralı ve örtüşmeli parçalara ayırır", () => {
  const text = Array.from({ length: 120 }, (_, index) => `Paragraf ${index}: görev dokümanı içeriği.`).join("\n\n");
  const chunks = chunkDocument(text, { chunkSize: 500, overlap: 80 });
  assert.ok(chunks.length > 2);
  assert.deepEqual(chunks.map((item) => item.chunkIndex), chunks.map((_, index) => index));
  assert.equal(chunks[0].sourceLabel, "Bölüm 1");
  assert.ok(chunks.every((item) => item.content.length <= 500));
  assert.ok(chunks.every((item) => item.tokenCount > 0));
});

test("geçersiz overlap değerini reddeder", () => {
  assert.throws(() => chunkDocument("örnek", { chunkSize: 10, overlap: 10 }), /overlap/i);
});
