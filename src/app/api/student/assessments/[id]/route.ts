import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { submitAttempt } from "@/server/assessments";

export const POST = api(async (req, ctx) => {
  const student = await requireStudent();
  const { id } = await ctx.params;
  const body = await readJson<{ answers: { questionId: string; optionIds?: string[]; text?: string }[] }>(req);
  return ok(await submitAttempt(student.id, id, body.answers ?? []));
});
