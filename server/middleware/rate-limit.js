import { HttpError } from "../errors.js";

// Her limiter kendi sayaç tablolarını kullanır; aksi halde farklı rotalar (asistan, kullanıcı oluşturma)
// aynı kullanıcı için ortak sayaç paylaşır.
const registry = new Set();

// Süresi dolan sayaçlar silinmezse tablolar sınırsız büyür.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const windows of registry) {
    for (const [key, entry] of windows) {
      if (entry.resetAt <= now) windows.delete(key);
    }
  }
}, 60_000);
cleanup.unref();

const DAY_MS = 24 * 60 * 60 * 1000;

// Sayacı bir artırır; sınır aşıldıysa true döner.
function hit(windows, key, limit, windowMs, now) {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

// limit/windowMs: kısa pencere (ör. dakikada 30). dailyLimit: ücretsiz LLM/embedding kotasını
// tek kullanıcının tüketmesini önleyen 24 saatlik üst sınır (0 = kapalı).
export function aiRateLimit({ limit = 30, windowMs = 60_000, dailyLimit = 0 } = {}) {
  const shortWindows = new Map();
  const dayWindows = new Map();
  registry.add(shortWindows);
  registry.add(dayWindows);
  return (request, _response, next) => {
    const key = request.user?.id || request.ip;
    const now = Date.now();
    if (hit(shortWindows, key, limit, windowMs, now)) {
      return next(new HttpError(429, "Çok fazla asistan isteği gönderildi. Lütfen kısa süre sonra tekrar deneyin.", "rate_limited"));
    }
    if (dailyLimit > 0 && hit(dayWindows, key, dailyLimit, DAY_MS, now)) {
      return next(new HttpError(429, "Günlük asistan kullanım sınırına ulaşıldı. Lütfen yarın tekrar deneyin.", "daily_quota_exceeded"));
    }
    next();
  };
}
