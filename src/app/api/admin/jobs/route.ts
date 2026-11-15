import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireAdmin } from "@/server/guards";
import { jobInput } from "@/server/job-input";
import { saveJob } from "@/server/jobs";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<Record<string, unknown>>(req);
  const job = await saveJob(admin.id, jobInput(body));
  return ok({ id: job.id }, 201);
});
