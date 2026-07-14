import { HttpError } from "../errors.js";

export function notFoundHandler(request, _response, next) {
  next(new HttpError(404, `${request.method} ${request.path} endpoint'i bulunamadı.`, "route_not_found"));
}

export function errorHandler(error, _request, response, _next) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error(error);
  response.status(status).json({
    error: {
      code: error.code || "internal_error",
      message: status >= 500 ? "Sunucuda beklenmeyen bir hata oluştu." : error.message,
      ...(error.details && process.env.NODE_ENV !== "production" ? { details: error.details } : {}),
    },
  });
}
