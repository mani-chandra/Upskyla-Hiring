import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { registerStudent } from "@/server/verification";

export const POST = api(async (req) => {
  const body = await readJson<{ name: string; email: string; phone: string; password: string }>(req);
  return ok(await registerStudent(body), 201);
});
