import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("doküman asistanı şeması ilişki, vektör arama ve RLS sözleşmesini içerir", async () => {
  const sql = await readFile(new URL("../../supabase-schema.sql", import.meta.url), "utf8");
  for (const pattern of [
    /create extension if not exists "vector"/i,
    /create table if not exists public\.document_chunks/i,
    /embedding extensions\.vector\(1024\)/i,
    /create table if not exists public\.document_chat_messages/i,
    /attachment_id uuid not null references public\.task_attachments/i,
    /create or replace function public\.match_document_chunks/i,
    /public\.can_access_task\(ta\.task_id\)/i,
    /create policy "document_chat_messages_related_select"/i,
  ]) assert.match(sql, pattern);
});
