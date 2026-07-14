import test from "node:test";
import assert from "node:assert/strict";
import { assistantSystemPrompt, buildDocumentQuestion } from "../services/llm-service.js";

test("asistan istemi dış bilgi ve doküman içi talimatları yasaklar", () => {
  assert.match(assistantSystemPrompt, /Yalnızca/);
  assert.match(assistantSystemPrompt, /güvenilmeyen veri/);
  assert.match(assistantSystemPrompt, /Bu bilgi dokümanda bulunmuyor/);
  assert.match(assistantSystemPrompt, /uydurma/);
});

test("soru yalnızca seçilen kaynak parçalarıyla paketlenir", () => {
  const prompt = buildDocumentQuestion({
    question: "Teslim tarihi nedir?",
    documentName: "plan.txt",
    contextChunks: [{ sourceLabel: "Bölüm 3", content: "Teslim 20 Temmuz." }],
  });
  assert.match(prompt, /\[Bölüm 3\]/);
  assert.match(prompt, /Teslim 20 Temmuz/);
  assert.match(prompt, /SORU:\nTeslim tarihi nedir/);
});
