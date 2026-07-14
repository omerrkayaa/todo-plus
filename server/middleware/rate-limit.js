import { HttpError } from "../errors.js";

const windows = new Map();

export function aiRateLimit({ limit = 30, windowMs = 60_000 } = {}) {
  return (request, _response, next) => {
    const key = request.user?.id || request.ip;
    const now = Date.now();
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > limit) return next(new HttpError(429, "Çok fazla asistan isteği gönderildi. Lütfen kısa süre sonra tekrar deneyin.", "rate_limited"));
    next();
  };
}
