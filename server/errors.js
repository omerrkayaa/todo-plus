export class HttpError extends Error {
  constructor(status, message, code = "request_failed", details = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const assertFound = (value, message = "Kayıt bulunamadı.") => {
  if (!value) throw new HttpError(404, message, "not_found");
  return value;
};
