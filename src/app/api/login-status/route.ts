import bcrypt from "bcryptjs";
import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { getPrisma } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";

export const POST = api(async (req) => {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  await rateLimit(`login-status:${email}`, 20, 15 * 60 * 1000);
  const prisma = await getPrisma();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return ok({ state: "invalid", error: "Email or password is incorrect." }, 401);
  }
  if (user.role === "STUDENT" && !user.emailVerified) return ok({ state: "verify_email", userId: user.id });
  if (user.role === "STUDENT" && !user.phoneVerified) return ok({ state: "verify_phone", userId: user.id });
  return ok({ state: "ok", role: user.role });
});
