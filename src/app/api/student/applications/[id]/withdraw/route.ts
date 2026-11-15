import { api, ok } from "@/server/http";
import { requireStudent } from "@/server/guards";
import { withdrawApplication } from "@/server/applications";

export const POST = api(async (_req, ctx) => {
  const student = await requireStudent();
  const { id } = await ctx.params;
  await withdrawApplication(student.id, id);
  return ok();
});
