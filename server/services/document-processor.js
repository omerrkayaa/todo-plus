import { createHash } from "node:crypto";
import { getConfig } from "../config.js";
import { HttpError } from "../errors.js";
import { getAdminClient } from "../supabase.js";
import { chunkDocument } from "./chunking.js";
import { parseDocument } from "./document-parser.js";
import { embedDocuments } from "./embedding-service.js";

const bucketName = "task-documents";

async function markFailed(documentId, error) {
  await getAdminClient().from("task_attachments").update({
    processing_status: "failed",
    processing_error: String(error?.message || "Bilinmeyen işleme hatası").slice(0, 1000),
  }).eq("id", documentId);
}

export async function processDocument(document) {
  const admin = getAdminClient();
  const config = getConfig({ requireAi: false });
  const { data: claimed, error: claimError } = await admin
    .from("task_attachments")
    .update({ processing_status: "processing", processing_error: null })
    .eq("id", document.id)
    .neq("processing_status", "processing")
    .select("id");
  if (claimError) throw new HttpError(500, "Doküman işleme kilidi alınamadı.", "document_claim_failed", claimError.message);
  if (!claimed?.length) throw new HttpError(409, "Doküman zaten işleniyor.", "document_already_processing");
  try {
    const { data: blob, error: downloadError } = await admin.storage.from(bucketName).download(document.storage_path);
    if (downloadError || !blob) throw new HttpError(502, "Doküman saklama alanından indirilemedi.", "document_download_failed", downloadError?.message);
    const buffer = Buffer.from(await blob.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");

    if (document.content_hash === hash && document.processing_status === "ready" && document.extracted_text) {
      await admin.from("task_attachments").update({ processing_status: "ready", processing_error: null }).eq("id", document.id);
      return document;
    }

    const parsed = await parseDocument({ buffer, fileName: document.file_name });
    const isLong = parsed.characterCount > config.shortDocumentCharLimit;
    const chunks = isLong ? chunkDocument(parsed.text, { chunkSize: config.chunkSize, overlap: config.chunkOverlap }) : [];

    const { error: deleteError } = await admin.from("document_chunks").delete().eq("attachment_id", document.id);
    if (deleteError) throw new HttpError(500, "Eski doküman indeksi temizlenemedi.", "chunk_delete_failed", deleteError.message);

    if (chunks.length) {
      const embeddings = await embedDocuments(chunks.map((chunk) => chunk.content));
      const rows = chunks.map((chunk, index) => ({
        attachment_id: document.id,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        token_count: chunk.tokenCount,
        source_label: chunk.sourceLabel,
        embedding: embeddings[index],
      }));
      for (let index = 0; index < rows.length; index += 100) {
        const { error } = await admin.from("document_chunks").insert(rows.slice(index, index + 100));
        if (error) throw new HttpError(500, "Doküman parçaları kaydedilemedi.", "chunk_insert_failed", error.message);
      }
    }

    const processedAt = new Date().toISOString();
    const update = {
      extracted_text: parsed.text,
      processing_status: "ready",
      processing_error: null,
      content_hash: hash,
      character_count: parsed.characterCount,
      parsed_at: processedAt,
      summary: document.content_hash === hash ? document.summary : null,
      summary_updated_at: document.content_hash === hash ? document.summary_updated_at : null,
    };
    const { data, error } = await admin.from("task_attachments").update(update).eq("id", document.id).select("*").single();
    if (error) throw new HttpError(500, "Doküman işleme sonucu kaydedilemedi.", "document_update_failed", error.message);
    return { ...data, is_long: isLong, chunk_count: chunks.length };
  } catch (error) {
    await markFailed(document.id, error);
    throw error;
  }
}
