import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ assessmentId: string; prompt: string; skillId?: string; correct: string; wrongA: string; wrongB: string }>(req);
  if (!body.prompt?.trim() || !body.correct || !body.wrongA || !body.wrongB) throw new AppError("Enter the prompt and three options.");
  const prisma = await getPrisma();
  const count = await prisma.assessmentQuestion.count({ where: { assessmentId: body.assessmentId } });
  const question = await prisma.assessmentQuestion.create({
    data: {
      assessmentId: body.assessmentId,
      type: "MCQ",
      prompt: body.prompt.trim(),
      skillId: body.skillId || null,
      points: 1,
      sortOrder: count + 1,
      options: {
        create: [
          { text: body.correct.trim(), isCorrect: true, sortOrder: 1 },
          { text: body.wrongA.trim(), isCorrect: false, sortOrder: 2 },
          { text: body.wrongB.trim(), isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });
  await audit(admin.id, "question.create", "AssessmentQuestion", question.id);
  return ok({ message: "Question added." });
});
