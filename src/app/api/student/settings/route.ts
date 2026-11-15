import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<Record<string, unknown>>(req);
  const prisma = await getPrisma();
  await prisma.notificationPreference.upsert({
    where: { userId: student.id },
    create: { userId: student.id, emailEnabled: body.emailEnabled === "true" || body.emailEnabled === true, inAppEnabled: body.inAppEnabled === "true" || body.inAppEnabled === true },
    update: { emailEnabled: body.emailEnabled === "true" || body.emailEnabled === true, inAppEnabled: body.inAppEnabled === "true" || body.inAppEnabled === true },
  });
  return ok({ message: "Settings saved." });
});
