import { LanguageProficiency, SoftSkillLevel } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { asArray } from "@/server/parse";
import { isSoftLevel, maybeNotifyOnboarding } from "@/server/profile";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<Record<string, unknown>>(req);
  const ids = asArray(body.languageId);
  if (ids.length === 0) throw new AppError("Select at least one language.");
  const soft = ["communicationSkill", "teamworkSkill", "problemSolvingSkill", "customerHandlingSkill"] as const;
  for (const key of soft) {
    if (!isSoftLevel(String(body[key] ?? ""))) throw new AppError("Choose a level for each workplace skill.");
  }
  const prisma = await getPrisma();
  await prisma.studentLanguage.deleteMany({ where: { userId: student.id } });
  for (const languageId of ids) {
    const level = String(body[`level-${languageId}`] ?? "BASIC");
    const proficiency = (["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT"].includes(level) ? level : "BASIC") as LanguageProficiency;
    await prisma.studentLanguage.create({ data: { userId: student.id, languageId, proficiency } });
  }
  await prisma.studentProfile.update({
    where: { userId: student.id },
    data: {
      communicationSkill: String(body.communicationSkill) as SoftSkillLevel,
      teamworkSkill: String(body.teamworkSkill) as SoftSkillLevel,
      problemSolvingSkill: String(body.problemSolvingSkill) as SoftSkillLevel,
      customerHandlingSkill: String(body.customerHandlingSkill) as SoftSkillLevel,
    },
  });
  await maybeNotifyOnboarding(student.id);
  return ok({ message: "Languages and workplace skills saved." });
});
