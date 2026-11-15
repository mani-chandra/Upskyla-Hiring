import { api, ok } from "@/server/http";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async () => {
  const student = await requireStudent();
  const prisma = await getPrisma();
  await prisma.notification.updateMany({ where: { userId: student.id, readAt: null }, data: { readAt: new Date() } });
  return ok({ message: "Notifications marked read." });
});
