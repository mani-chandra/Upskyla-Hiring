import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { resendCode } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ userId: string; type: string }>(req);
  if (body.type !== "email" && body.type !== "phone") throw new AppError("Choose email or phone.");
  return ok(await resendCode(body.userId, body.type));
});
