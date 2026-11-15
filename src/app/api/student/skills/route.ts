import { Proficiency } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { asArray } from "@/server/parse";
import { maybeNotifyOnboarding } from "@/server/profile";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<Record<string, unknown>>(req);
  const ids = asArray(body.skillId);
  const prisma = await getPrisma();
  await prisma.studentSkill.deleteMany({ where: { userId: student.id } });
  for (const skillId of ids) {
    const level = String(body[`level-${skillId}`] ?? "BEGINNER");
    const proficiency = (["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level) ? level : "BEGINNER") as Proficiency;
    await prisma.studentSkill.create({ data: { userId: student.id, skillId, proficiency } });
  }
  await maybeNotifyOnboarding(student.id);
  return ok({ message: "Technical skills saved." });
});
