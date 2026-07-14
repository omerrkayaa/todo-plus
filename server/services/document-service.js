import { HttpError } from "../errors.js";

export async function getAuthorizedDocument(documentId, userSupabase) {
  const { data, error } = await userSupabase
    .from("task_attachments")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();
  if (error) throw new HttpError(500, "Doküman bilgisi alınamadı.", "document_query_failed", error.message);
  if (!data) throw new HttpError(404, "Doküman bulunamadı veya bu dokümana erişim yetkiniz yok.", "document_not_found");
  return data;
}

export async function getDocumentMessages(documentId, userSupabase, limit = 100) {
  const { data, error } = await userSupabase
    .from("document_chat_messages")
    .select("id, attachment_id, task_id, user_id, role, content, source_chunks, created_at")
    .eq("attachment_id", documentId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new HttpError(500, "Sohbet geçmişi alınamadı.", "message_query_failed", error.message);
  return data || [];
}

export async function getRecentMessages(documentId, userSupabase, limit = 8) {
  const { data, error } = await userSupabase
    .from("document_chat_messages")
    .select("role, content, created_at")
    .eq("attachment_id", documentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new HttpError(500, "Sohbet bağlamı alınamadı.", "message_query_failed", error.message);
  return (data || []).reverse();
}
