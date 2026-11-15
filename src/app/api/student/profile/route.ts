import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { assertAdult, maybeNotifyOnboarding } from "@/server/profile";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<{ name?: string; dateOfBirth?: string; address?: string; currentLocation?: string }>(req);
  const name = String(body.name ?? "").trim();
  const date = new Date(String(body.dateOfBirth ?? ""));
  if (name.length < 2) throw new AppError("Enter your full name.");
  if (Number.isNaN(date.getTime()) || !assertAdult(date)) throw new AppError("Enter a date of birth. Students must be 18 or older.");
  const prisma = await getPrisma();
  await prisma.user.update({ where: { id: student.id }, data: { name } });
  await prisma.studentProfile.update({
    where: { userId: student.id },
    data: {
      dateOfBirth: date,
      address: String(body.address ?? "").trim(),
      currentLocation: String(body.currentLocation ?? "").trim(),
      onboardingStep: "education",
    },
  });
  await maybeNotifyOnboarding(student.id);
  return ok({ message: "Personal details saved." });
});
