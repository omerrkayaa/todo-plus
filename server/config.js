import "dotenv/config";

const integer = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function getConfig({ requireAi = true } = {}) {
  const config = {
    port: integer(process.env.PORT, 3000),
    corsOrigins: (process.env.CORS_ORIGIN || "http://127.0.0.1:4173,http://localhost:4173")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    voyageApiKey: process.env.VOYAGE_API_KEY || "",
    voyageModel: process.env.VOYAGE_MODEL || "voyage-4-lite",
    shortDocumentCharLimit: integer(process.env.SHORT_DOCUMENT_CHAR_LIMIT, 12000),
    chunkSize: integer(process.env.DOCUMENT_CHUNK_SIZE, 4000),
    chunkOverlap: integer(process.env.DOCUMENT_CHUNK_OVERLAP, 500),
    ragMatchCount: Math.min(integer(process.env.RAG_MATCH_COUNT, 6), 12),
  };

  const required = ["supabaseUrl", "supabaseAnonKey", "supabaseServiceRoleKey"];
  if (requireAi) required.push("geminiApiKey", "voyageApiKey");
  const missing = required.filter((key) => !config[key]);
  if (missing.length) throw new Error(`Eksik sunucu ayarları: ${missing.join(", ")}`);
  if (config.chunkOverlap >= config.chunkSize) throw new Error("DOCUMENT_CHUNK_OVERLAP, DOCUMENT_CHUNK_SIZE değerinden küçük olmalıdır.");
  return Object.freeze(config);
}
