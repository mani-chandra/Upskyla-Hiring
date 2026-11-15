import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { resendCode, verifyEmail } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ userId: string; code: string }>(req);
  await verifyEmail(body.userId, body.code);
  const phone = await resendCode(body.userId, "phone");
  return ok({ devPhoneCode: phone.devCode });
});
