import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requestPasswordReset } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ email: string }>(req);
  return ok(await requestPasswordReset(body.email ?? ""));
});
