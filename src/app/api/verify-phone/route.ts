import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { verifyPhone } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ userId: string; code: string }>(req);
  await verifyPhone(body.userId, body.code);
  return ok();
});
