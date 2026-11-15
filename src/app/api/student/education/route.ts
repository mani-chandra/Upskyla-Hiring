import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { maybeNotifyOnboarding } from "@/server/profile";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<Record<string, string>>(req);
  const year = Number(body.graduationYear);
  if (!body.college || !body.degree || !body.branch || year < 1990 || year > 2040) {
    throw new AppError("Enter your college, degree, branch and graduation year.");
  }
  const prisma = await getPrisma();
  await prisma.education.upsert({
    where: { userId: student.id },
    create: {
      userId: student.id,
      college: body.college.trim(),
      degree: body.degree.trim(),
      branch: body.branch.trim(),
      graduationYear: year,
      academicDetails: body.academicDetails?.trim() || null,
    },
    update: {
      college: body.college.trim(),
      degree: body.degree.trim(),
      branch: body.branch.trim(),
      graduationYear: year,
      academicDetails: body.academicDetails?.trim() || null,
    },
  });
  await maybeNotifyOnboarding(student.id);
  return ok({ message: "Education saved." });
});
