import { CourseCategory } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { notify } from "@/server/notifications";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ audience: string; title: string; body: string }>(req);
  if (!body.title?.trim() || !body.body?.trim()) throw new AppError("Enter a title and a message.");
  const prisma = await getPrisma();
  const audience = body.audience;
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(audience && audience !== "ALL"
        ? { enrollments: { some: { status: "ACTIVE", course: { category: audience as CourseCategory } } } }
        : {}),
    },
    select: { id: true },
  });
  for (const student of students) {
    await notify({ userId: student.id, type: "broadcast", title: body.title.trim(), body: body.body.trim() });
  }
  await audit(admin.id, "notification.broadcast", "Notification", undefined, { audience, count: students.length });
  return ok({ message: `Sent to ${students.length} students.` });
});
