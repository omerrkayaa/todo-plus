import { HttpError } from "../errors.js";

export async function requireAdmin(request, _response, next) {
  try {
    const { data, error } = await request.supabase.from("users").select("role").eq("id", request.user.id).maybeSingle();
    if (error) throw new HttpError(500, "Yetki bilgisi alınamadı.", "role_query_failed", error.message);
    if (data?.role !== "admin") throw new HttpError(403, "Bu işlem yalnızca yöneticiler için açık.", "admin_required");
    next();
  } catch (error) {
    next(error);
  }
}
