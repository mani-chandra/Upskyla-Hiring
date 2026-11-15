import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getStudentBundle } from "@/server/profile";
import { createApplication } from "@/server/applications";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const session = await requireStudent();
  const body = await readJson<{ jobId: string; consent: boolean }>(req);
  const student = await getStudentBundle(session.id);
  if (!student) throw new AppError("Student not found.", 404);
  const prisma = await getPrisma();
  const job = await prisma.jobDescription.findUnique({
    where: { id: body.jobId },
    include: { company: true, requirements: { include: { skill: true } }, languages: { include: { language: true } }, eligibility: true },
  });
  if (!job) throw new AppError("Job not found.", 404);
  await createApplication(student, job, Boolean(body.consent));
  return ok({}, 201);
});
