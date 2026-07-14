import { createClient } from "@supabase/supabase-js";
import { getConfig } from "./config.js";

let adminClient;

export function getAdminClient() {
  if (!adminClient) {
    const config = getConfig({ requireAi: false });
    adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function createUserClient(accessToken) {
  const config = getConfig({ requireAi: false });
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
