import "server-only";
import { ApplicationStatus } from "@/generated/prisma/client";
import { AppError } from "@/server/errors";
import { getPrisma } from "@/server/db";
import { eligibilityIssues, personFromStudent, type JobMatch } from "@/server/eligibility";
import { notify } from "@/server/notifications";
import { type StudentBundle } from "@/server/profile";

const adminTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["UNDER_REVIEW", "REJECTED", "ON_HOLD"],
  UNDER_REVIEW: ["MOCK_INTERVIEW_SCHEDULED", "SHORTLISTED", "REJECTED", "ON_HOLD"],
  MOCK_INTERVIEW_SCHEDULED: ["MOCK_INTERVIEW_COMPLETED", "REJECTED", "ON_HOLD"],
  MOCK_INTERVIEW_COMPLETED: ["SHORTLISTED", "REJECTED", "ON_HOLD"],
  SHORTLISTED: ["FORWARDED_TO_COMPANY", "REJECTED", "ON_HOLD"],
  FORWARDED_TO_COMPANY: ["COMPANY_INTERVIEW_SCHEDULED", "SELECTED", "REJECTED", "ON_HOLD"],
  COMPANY_INTERVIEW_SCHEDULED: ["COMPANY_INTERVIEW_COMPLETED", "SELECTED", "REJECTED", "ON_HOLD"],
  COMPANY_INTERVIEW_COMPLETED: ["SELECTED", "REJECTED", "ON_HOLD"],
  ON_HOLD: ["UNDER_REVIEW", "REJECTED"],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const studentWithdraw: ApplicationStatus[] = [
  "APPLIED",
  "UNDER_REVIEW",
  "MOCK_INTERVIEW_SCHEDULED",
  "MOCK_INTERVIEW_COMPLETED",
  "SHORTLISTED",
  "ON_HOLD",
];

const statusCopy: Record<ApplicationStatus, string> = {
  APPLIED: "Your application has been submitted.",
  UNDER_REVIEW: "Upskyla is reviewing your application.",
  MOCK_INTERVIEW_SCHEDULED: "A mock interview has been scheduled.",
  MOCK_INTERVIEW_COMPLETED: "Your mock interview is complete.",
  SHORTLISTED: "You have been shortlisted. This is not a job offer.",
  FORWARDED_TO_COMPANY: "Your profile has been forwarded to the hiring company.",
  COMPANY_INTERVIEW_SCHEDULED: "The company interview has been scheduled.",
  COMPANY_INTERVIEW_COMPLETED: "The company interview is marked complete. The company makes the hiring decision.",
  SELECTED: "The company selected you. Joining is recorded separately if you accept and start.",
  REJECTED: "This application will not move forward.",
  ON_HOLD: "This application is on hold.",
  WITHDRAWN: "You withdrew this application.",
};

export function canAdminTransition(from: ApplicationStatus, to: ApplicationStatus) {
  return adminTransitions[from].includes(to);
}

async function setStatus(applicationId: string, to: ApplicationStatus, actorId: string | null, note?: string) {
  const prisma = await getPrisma();
  const current = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!current) throw new AppError("Application not found.", 404);
  if (current.status === to) return current;
  const updated = await prisma.$transaction(async (tx) => {
    const fresh = await tx.application.findUnique({ where: { id: applicationId } });
    if (!fresh) throw new AppError("Application not found.", 404);
    if (actorId && !canAdminTransition(fresh.status, to) && to !== "WITHDRAWN") {
      throw new AppError("That status change is not allowed from the current stage.");
    }
    const row = await tx.application.update({
      where: { id: applicationId },
      data: { status: to, ...(to === "WITHDRAWN" ? {} : {}) },
      include: { job: true, user: true },
    });
    await tx.applicationStatusHistory.create({
      data: { applicationId, fromStatus: fresh.status, toStatus: to, note, actorId },
    });
    return row;
  });
  await notify({
    userId: updated.userId,
    type: "application_status",
    title: `Application update: ${updated.job.title}`,
    body: statusCopy[to],
  });
  return updated;
}

export async function createApplication(student: StudentBundle, job: JobMatch, consent: boolean) {
  if (!consent) throw new AppError("Consent is required before Upskyla can share your profile with a hiring company.");
  const person = personFromStudent(student);
  if (!person) throw new AppError("Choose a course and complete payment before applying.");
  const issues = eligibilityIssues(person, job, { forApply: true });
  if (issues.length) throw new AppError(issues[0]);
  const prisma = await getPrisma();
  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: student.id, jobId: job.id } },
  });
  if (existing && existing.status !== "WITHDRAWN") {
    throw new AppError("You have already applied for this role.");
  }
  const application = await prisma.$transaction(async (tx) => {
    const again = await tx.application.findUnique({
      where: { userId_jobId: { userId: student.id, jobId: job.id } },
    });
    if (again && again.status !== "WITHDRAWN") throw new AppError("You have already applied for this role.");
    if (again) {
      const reopened = await tx.application.update({
        where: { id: again.id },
        data: { status: "APPLIED", consentToShare: true },
      });
      await tx.applicationStatusHistory.create({
        data: { applicationId: reopened.id, fromStatus: "WITHDRAWN", toStatus: "APPLIED", note: "Applied again with consent.", actorId: student.id },
      });
      return reopened;
    }
    const created = await tx.application.create({
      data: { userId: student.id, jobId: job.id, consentToShare: true, status: "APPLIED" },
    });
    await tx.applicationStatusHistory.create({
      data: { applicationId: created.id, toStatus: "APPLIED", note: "Candidate consented to share their profile.", actorId: student.id },
    });
    return created;
  });
  await notify({
    userId: student.id,
    type: "application_submitted",
    title: `Application submitted: ${job.title}`,
    body: `${statusCopy.APPLIED} ${job.company.name} will see your profile only if Upskyla forwards you after screening.`,
  });
  return application;
}

export async function withdrawApplication(studentId: string, applicationId: string) {
  const prisma = await getPrisma();
  const application = await prisma.application.findFirst({ where: { id: applicationId, userId: studentId } });
  if (!application) throw new AppError("Application not found.", 404);
  if (!studentWithdraw.includes(application.status)) {
    throw new AppError("This application can no longer be withdrawn.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.application.update({ where: { id: application.id }, data: { status: "WITHDRAWN" } });
    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: "WITHDRAWN",
        actorId: studentId,
        note: "Withdrawn by the student.",
      },
    });
  });
}

export async function adminSetStatus(actorId: string, applicationId: string, to: ApplicationStatus, note?: string) {
  const prisma = await getPrisma();
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new AppError("Application not found.", 404);
  if (!canAdminTransition(application.status, to)) {
    throw new AppError("That status change is not allowed from the current stage.");
  }
  return setStatus(applicationId, to, actorId, note);
}

export function safeMeetingLink(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("Enter a valid meeting link.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new AppError("Meeting links must start with http or https.");
  return url.toString();
}
