import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ name: string; description: string; maxScore: string }>(req);
  if (!body.name?.trim()) throw new AppError("Enter a criterion name.");
  const prisma = await getPrisma();
  const count = await prisma.scoringCriterion.count();
  const criterion = await prisma.scoringCriterion.create({
    data: { name: body.name.trim(), description: body.description?.trim() || "Scoring criterion", maxScore: Number(body.maxScore) || 5, sortOrder: count + 1 },
  });
  await audit(admin.id, "criterion.create", "ScoringCriterion", criterion.id);
  return ok({ message: "Criterion added." });
});
