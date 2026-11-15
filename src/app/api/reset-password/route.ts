import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { resetPassword } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ email: string; code: string; password: string }>(req);
  await resetPassword(body.email ?? "", body.code ?? "", body.password ?? "");
  return ok();
});
