import { HttpError } from "../errors.js";
import { createUserClient, getAdminClient } from "../supabase.js";

export async function requireAuth(request, _response, next) {
  try {
    const authorization = request.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new HttpError(401, "Oturum doğrulaması gerekli.", "missing_token");

    const accessToken = match[1];
    const { data, error } = await getAdminClient().auth.getUser(accessToken);
    if (error || !data.user) throw new HttpError(401, "Oturum geçersiz veya süresi dolmuş.", "invalid_token");

    request.user = data.user;
    request.accessToken = accessToken;
    request.supabase = createUserClient(accessToken);
    next();
  } catch (error) {
    next(error);
  }
}
