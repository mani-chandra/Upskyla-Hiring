import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ name: string }>(req);
  const name = body.name?.trim();
  if (!name) throw new AppError("Enter a skill name.");
  const prisma = await getPrisma();
  const skill = await prisma.skill.create({ data: { name, category: "technical" } });
  await audit(admin.id, "skill.create", "Skill", skill.id);
  return ok({ message: "Skill added." });
});
