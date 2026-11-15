import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireAdmin } from "@/server/guards";
import { jobInput } from "@/server/job-input";
import { saveJob } from "@/server/jobs";

export const PUT = api(async (req, ctx) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(req);
  await saveJob(admin.id, jobInput(body), id);
  return ok({ message: "Job description saved." });
});
