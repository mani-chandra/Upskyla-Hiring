import "server-only";
import { CourseCategory, Proficiency, QuestionType } from "@/generated/prisma/client";
import { AppError } from "@/server/errors";
import { getPrisma } from "@/server/db";
import { notify } from "@/server/notifications";

type AnswerInput = { questionId: string; optionIds?: string[]; text?: string };

function levelFor(percent: number): Proficiency {
  if (percent >= 80) return Proficiency.ADVANCED;
  if (percent >= 50) return Proficiency.INTERMEDIATE;
  return Proficiency.BEGINNER;
}

export async function submitAttempt(userId: string, assessmentId: string, answers: AnswerInput[]) {
  const prisma = await getPrisma();
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { course: true },
  });
  if (!enrollment) throw new AppError("An active enrollment is required before assessments.");
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { include: { options: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!assessment) throw new AppError("Assessment not found.", 404);
  if (!assessment.appliesTo.includes(enrollment.course.category as CourseCategory)) {
    throw new AppError("This assessment is not part of your course.");
  }
  const byId = new Map(answers.map((item) => [item.questionId, item]));
  let score = 0;
  let maxScore = 0;
  let pending = false;
  const rows: { questionId: string; response: object; awarded: number; reviewed: boolean; skillId: string | null; points: number }[] = [];
  for (const question of assessment.questions) {
    const answer = byId.get(question.id);
    if (!answer) throw new AppError("Answer every question before submitting.");
    const correct = new Set(question.options.filter((option) => option.isCorrect).map((option) => option.id));
    const selected = answer.optionIds ?? [];
    let awarded = 0;
    let reviewed = true;
    if (question.type === QuestionType.CODING) {
      if (!answer.text?.trim()) throw new AppError("Write an answer for the coding question.");
      pending = true;
      reviewed = false;
      maxScore += question.points;
    } else if (question.type === QuestionType.MULTI_SELECT) {
      maxScore += question.points;
      const sameSize = selected.length === correct.size;
      const all = selected.every((id) => correct.has(id));
      awarded = sameSize && all ? question.points : 0;
      score += awarded;
    } else {
      maxScore += question.points;
      awarded = selected.length === 1 && correct.has(selected[0]) ? question.points : 0;
      score += awarded;
    }
    rows.push({
      questionId: question.id,
      response: { optionIds: selected, text: answer.text?.slice(0, 8000) ?? "" },
      awarded,
      reviewed,
      skillId: question.skillId,
      points: question.points,
    });
  }
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId,
      assessmentId,
      score,
      maxScore,
      pendingReview: pending,
      answers: { create: rows.map(({ questionId, response, awarded, reviewed }) => ({ questionId, response, awarded, reviewed })) },
    },
  });
  const skillScores = new Map<string, { awarded: number; points: number }>();
  for (const row of rows) {
    if (!row.skillId || !row.reviewed) continue;
    const current = skillScores.get(row.skillId) ?? { awarded: 0, points: 0 };
    current.awarded += row.awarded;
    current.points += row.points;
    skillScores.set(row.skillId, current);
  }
  for (const [skillId, value] of skillScores) {
    if (value.points === 0) continue;
    const percent = Math.round((value.awarded / value.points) * 100);
    if (percent < 60) continue;
    await prisma.verifiedSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: { userId, skillId, score: percent, level: levelFor(percent), sourceAttemptId: attempt.id },
      update: { score: percent, level: levelFor(percent), sourceAttemptId: attempt.id },
    });
  }
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  await notify({
    userId,
    type: "assessment_result",
    title: `Assessment result: ${assessment.title}`,
    body: pending
      ? `Your auto-scored result is ${score} of ${maxScore}. A coding answer is waiting for review.`
      : `You scored ${score} of ${maxScore} (${percent}%). Verified skills are updated separately from the skills you reported yourself.`,
  });
  return { attemptId: attempt.id, score, maxScore, pendingReview: pending };
}

export async function reviewCodingAnswer(actorId: string, answerId: string, awarded: number) {
  const prisma = await getPrisma();
  const answer = await prisma.assessmentAnswer.findUnique({
    include: { question: true, attempt: true },
    where: { id: answerId },
  });
  if (!answer || answer.question.type !== "CODING") throw new AppError("Coding answer not found.", 404);
  if (awarded < 0 || awarded > answer.question.points) throw new AppError("Score is outside the available points.");
  await prisma.assessmentAnswer.update({ where: { id: answerId }, data: { awarded, reviewed: true } });
  const answers = await prisma.assessmentAnswer.findMany({ where: { attemptId: answer.attemptId } });
  const score = answers.reduce((sum, item) => sum + (item.id === answerId ? awarded : item.awarded), 0);
  const pending = answers.some((item) => (item.id === answerId ? false : !item.reviewed));
  await prisma.assessmentAttempt.update({
    where: { id: answer.attemptId },
    data: { score, pendingReview: pending },
  });
  if (answer.question.skillId && answer.question.points > 0) {
    const percent = Math.round((awarded / answer.question.points) * 100);
    if (percent >= 60) {
      await prisma.verifiedSkill.upsert({
        where: { userId_skillId: { userId: answer.attempt.userId, skillId: answer.question.skillId } },
        create: {
          userId: answer.attempt.userId,
          skillId: answer.question.skillId,
          score: percent,
          level: levelFor(percent),
          sourceAttemptId: answer.attemptId,
        },
        update: { score: percent, level: levelFor(percent), sourceAttemptId: answer.attemptId },
      });
    }
  }
  await notify({
    userId: answer.attempt.userId,
    type: "assessment_result",
    title: "Coding answer reviewed",
    body: `An administrator scored your coding answer ${awarded} of ${answer.question.points}.`,
  });
  const { audit } = await import("@/server/guards");
  await audit(actorId, "assessment.review", "AssessmentAnswer", answerId, { awarded });
}
