import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireAdmin } from "@/server/guards";
import { handleApplicationAction } from "@/server/recruitment";

export const POST = api(async (req, ctx) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(req);
  await handleApplicationAction(admin.id, id, body);
  return ok({ message: "Saved." });
});
