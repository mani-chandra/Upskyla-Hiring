import { JobStatus } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireAdmin } from "@/server/guards";
import { setJobStatus } from "@/server/jobs";

export const POST = api(async (req, ctx) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const body = await readJson<{ status: string }>(req);
  if (!["PUBLISHED", "CLOSED", "ARCHIVED", "DRAFT"].includes(body.status)) throw new AppError("Choose a status.");
  const result = await setJobStatus(admin.id, id, body.status as JobStatus);
  return ok({ message: body.status === "PUBLISHED" ? `Published. ${result.matches} students were notified.` : "Status updated." });
});
