import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireAdmin } from "@/server/guards";
import { reviewCodingAnswer } from "@/server/assessments";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ answerId: string; awarded: string }>(req);
  await reviewCodingAnswer(admin.id, body.answerId, Number(body.awarded));
  return ok({ message: "Score saved." });
});
