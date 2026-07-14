import test from "node:test";
import assert from "node:assert/strict";
import { retrieveDocumentContext } from "../services/retrieval-service.js";

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";
process.env.GEMINI_API_KEY ||= "test-gemini-key";
process.env.VOYAGE_API_KEY ||= "test-voyage-key";

test("kısa dokümanda tüm metni doğrudan bağlam yapar", async () => {
  const document = { id: "doc-1", character_count: 50, extracted_text: "Görev teslim tarihi 20 Temmuz." };
  const context = await retrieveDocumentContext(document, "Teslim ne zaman?", {});
  assert.equal(context.length, 1);
  assert.equal(context[0].content, document.extracted_text);
  assert.equal(context[0].sourceLabel, "Belgenin tamamı");
});

test("uzun dokümanda soru embedding'i ve dokümana filtreli RPC kullanır", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ data: [{ index: 0, embedding: Array(1024).fill(0.01) }] }),
  });
  let rpcArguments;
  const userSupabase = {
    rpc: async (name, args) => {
      assert.equal(name, "match_document_chunks");
      rpcArguments = args;
      return { data: [{ id: "chunk-1", chunk_index: 4, content: "İlgili parça", source_label: "Bölüm 5", similarity: 0.82 }], error: null };
    },
  };
  try {
    const context = await retrieveDocumentContext({
      id: "00000000-0000-4000-8000-000000000001",
      character_count: 20000,
      extracted_text: "uzun",
    }, "Teslim tarihi nedir?", userSupabase);
    assert.equal(rpcArguments.document_uuid, "00000000-0000-4000-8000-000000000001");
    assert.equal(rpcArguments.query_embedding.length, 1024);
    assert.equal(context[0].sourceLabel, "Bölüm 5");
    assert.equal(context[0].content, "İlgili parça");
  } finally {
    global.fetch = originalFetch;
  }
});
