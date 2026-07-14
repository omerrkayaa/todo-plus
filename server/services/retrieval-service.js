import { getConfig } from "../config.js";
import { HttpError } from "../errors.js";
import { chunkDocument } from "./chunking.js";
import { embedQuery } from "./embedding-service.js";

export async function retrieveDocumentContext(document, question, userSupabase) {
  const config = getConfig();
  if (document.character_count <= config.shortDocumentCharLimit) {
    return [{
      id: null,
      chunkIndex: 0,
      content: document.extracted_text,
      sourceLabel: "Belgenin tamamı",
      similarity: 1,
    }];
  }

  const queryEmbedding = await embedQuery(question);
  const { data, error } = await userSupabase.rpc("match_document_chunks", {
    document_uuid: document.id,
    query_embedding: queryEmbedding,
    match_threshold: 0.18,
    match_count: config.ragMatchCount,
  });
  if (error) throw new HttpError(500, "Doküman parçalarında arama yapılamadı.", "retrieval_failed", error.message);
  return (data || []).map((item) => ({
    id: item.id,
    chunkIndex: item.chunk_index,
    content: item.content,
    sourceLabel: item.source_label || `Bölüm ${item.chunk_index + 1}`,
    similarity: item.similarity,
  }));
}

export function getSummaryChunks(document) {
  const config = getConfig({ requireAi: false });
  return chunkDocument(document.extracted_text, { chunkSize: config.chunkSize, overlap: config.chunkOverlap });
}
