import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { createFirstAdmin } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ name: string; email: string; password: string }>(req);
  await createFirstAdmin(body);
  return ok();
});
