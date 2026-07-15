import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { getAdminClient } from "../supabase.js";
import { answerFromDocument, summarizeDocument } from "../services/llm-service.js";
import { processDocument } from "../services/document-processor.js";
import { getAuthorizedDocument, getDocumentMessages, getRecentMessages, getTaskContext } from "../services/document-service.js";
import { getSummaryChunks, retrieveDocumentContext } from "../services/retrieval-service.js";

const router = Router();
const idSchema = z.string().uuid();
const chatSchema = z.object({ question: z.string().trim().min(2).max(2000) });
const limiter = aiRateLimit({ limit: 30, windowMs: 60_000 });

const parseDocumentId = (request) => {
  const result = idSchema.safeParse(request.params.id);
  if (!result.success) throw new HttpError(400, "Geçersiz doküman kimliği.", "invalid_document_id");
  return result.data;
};

router.use(requireAuth);

router.post("/:id/process", limiter, async (request, response) => {
  const document = await getAuthorizedDocument(parseDocumentId(request), request.supabase);
  const processed = await processDocument(document);
  response.json({
    document: {
      id: processed.id,
      status: processed.processing_status,
      characterCount: processed.character_count,
      pageCount: processed.page_count,
      parsedAt: processed.parsed_at,
      isLong: Boolean(processed.is_long ?? processed.character_count > 12000),
      chunkCount: processed.chunk_count,
    },
  });
});

router.get("/:id/status", async (request, response) => {
  const document = await getAuthorizedDocument(parseDocumentId(request), request.supabase);
  response.json({
    document: {
      id: document.id,
      name: document.file_name,
      status: document.processing_status,
      error: document.processing_error,
      characterCount: document.character_count,
      pageCount: document.page_count,
      parsedAt: document.parsed_at,
      hasSummary: Boolean(document.summary),
    },
  });
});

router.get("/:id/messages", async (request, response) => {
  const documentId = parseDocumentId(request);
  await getAuthorizedDocument(documentId, request.supabase);
  response.json({ messages: await getDocumentMessages(documentId, request.supabase) });
});

router.post("/:id/chat", limiter, async (request, response) => {
  const documentId = parseDocumentId(request);
  const input = chatSchema.safeParse(request.body);
  if (!input.success) throw new HttpError(400, "Soru 2 ile 2000 karakter arasında olmalıdır.", "invalid_question");
  const document = await getAuthorizedDocument(documentId, request.supabase);
  if (document.processing_status !== "ready" || !document.extracted_text) {
    throw new HttpError(409, "Doküman henüz soru-cevap için hazır değil.", "document_not_ready");
  }

  const history = await getRecentMessages(documentId, request.supabase);
  const context = await retrieveDocumentContext(document, input.data.question, request.supabase);
  const task = await getTaskContext(document.task_id, request.supabase);
  const admin = getAdminClient();
  const messageBase = { attachment_id: document.id, task_id: document.task_id, user_id: request.user.id };
  const { data: userMessage, error: userError } = await admin.from("document_chat_messages").insert({
    ...messageBase,
    role: "user",
    content: input.data.question,
  }).select("*").single();
  if (userError) throw new HttpError(500, "Soru geçmişe kaydedilemedi.", "message_insert_failed", userError.message);

  const answer = await answerFromDocument({
    question: input.data.question,
    contextChunks: context,
    history,
    documentName: document.file_name,
    pageCount: document.page_count,
    taskTitle: task?.title,
    taskDescription: task?.description,
  });
  const sources = context.map((item) => ({
    id: item.id,
    chunkIndex: item.chunkIndex,
    label: item.sourceLabel,
    similarity: Number(item.similarity?.toFixed?.(4) ?? item.similarity),
  }));
  const { data: assistantMessage, error: assistantError } = await admin.from("document_chat_messages").insert({
    ...messageBase,
    role: "assistant",
    content: answer,
    source_chunks: sources,
  }).select("*").single();
  if (assistantError) throw new HttpError(500, "Asistan cevabı geçmişe kaydedilemedi.", "message_insert_failed", assistantError.message);

  response.json({ userMessage, assistantMessage });
});

router.post("/:id/summary", limiter, async (request, response) => {
  const documentId = parseDocumentId(request);
  const document = await getAuthorizedDocument(documentId, request.supabase);
  if (document.processing_status !== "ready" || !document.extracted_text) {
    throw new HttpError(409, "Doküman henüz özetlenmeye hazır değil.", "document_not_ready");
  }
  if (document.summary && request.body?.force !== true) return response.json({ summary: document.summary, cached: true });

  const summary = await summarizeDocument({
    text: document.extracted_text,
    chunks: getSummaryChunks(document),
    documentName: document.file_name,
  });
  const { error } = await getAdminClient().from("task_attachments").update({
    summary,
    summary_updated_at: new Date().toISOString(),
  }).eq("id", document.id);
  if (error) throw new HttpError(500, "Doküman özeti kaydedilemedi.", "summary_update_failed", error.message);
  response.json({ summary, cached: false });
});

export default router;
