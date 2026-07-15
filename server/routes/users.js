import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { getAdminClient } from "../supabase.js";
import { generateTempPassword } from "../services/password-generator.js";

const router = Router();
const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(["user", "admin"]).default("user"),
});
const limiter = aiRateLimit({ limit: 10, windowMs: 60_000 });

router.use(requireAuth, requireAdmin);

router.post("/", limiter, async (request, response) => {
  const input = createUserSchema.safeParse(request.body);
  if (!input.success) throw new HttpError(400, "Ad soyad, e-posta ve rol geçerli olmalıdır.", "invalid_user_input");
  const { fullName, email, role } = input.data;
  const admin = getAdminClient();
  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (createError) throw new HttpError(400, `Kullanıcı oluşturulamadı: ${createError.message}`, "user_create_failed");

  const { error: profileError } = await admin.from("users").upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    role,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new HttpError(500, "Kullanıcı profili kaydedilemedi.", "profile_create_failed", profileError.message);
  }

  response.status(201).json({
    user: { id: created.user.id, fullName, email, role },
    tempPassword,
  });
});

export default router;
