import { ApplicationStatus, HiringOutcomeType, InterviewType } from "@/generated/prisma/client";
import { adminSetStatus, safeMeetingLink } from "@/server/applications";
import { AppError } from "@/server/errors";
import { audit } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { notify } from "@/server/notifications";

export async function handleApplicationAction(actorId: string, applicationId: string, body: Record<string, unknown>) {
  const prisma = await getPrisma();
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, user: true },
  });
  if (!application) throw new AppError("Application not found.", 404);
  const action = String(body.action ?? "");

  if (action === "note") {
    await prisma.application.update({ where: { id: applicationId }, data: { internalNotes: String(body.internalNotes ?? "").slice(0, 4000) } });
    await audit(actorId, "application.note", "Application", applicationId);
    return;
  }

  if (action === "status") {
    const status = String(body.status ?? "") as ApplicationStatus;
    await adminSetStatus(actorId, applicationId, status, String(body.note ?? "") || undefined);
    await audit(actorId, "application.status", "Application", applicationId, { status });
    return;
  }

  if (action === "schedule") {
    const when = new Date(String(body.scheduledAt ?? ""));
    if (Number.isNaN(when.getTime())) throw new AppError("Choose a valid date and time.");
    const type = String(body.type ?? "MOCK") === "COMPANY" ? InterviewType.COMPANY : InterviewType.MOCK;
    const link = body.meetingLink ? safeMeetingLink(String(body.meetingLink)) : null;
    const interviewerId = String(body.interviewerId ?? "") || null;
    await prisma.interview.create({
      data: {
        applicationId,
        type,
        scheduledAt: when,
        meetingLink: link,
        interviewerId,
        status: "SCHEDULED",
      },
    });
    const next = type === "MOCK" ? "MOCK_INTERVIEW_SCHEDULED" : "COMPANY_INTERVIEW_SCHEDULED";
    if (application.status !== next) {
      try {
        await adminSetStatus(actorId, applicationId, next as ApplicationStatus, "Interview scheduled.");
      } catch {
        await notify({
          userId: application.userId,
          type: type === "MOCK" ? "mock_interview" : "company_interview",
          title: type === "MOCK" ? "Mock interview scheduled" : "Company interview scheduled",
          body: `${application.job.title} is scheduled for ${when.toLocaleString("en-IN")}.`,
        });
      }
    }
    await audit(actorId, "interview.schedule", "Application", applicationId, { type });
    return;
  }

  if (action === "feedback") {
    const interviewId = String(body.interviewId ?? "");
    const interview = await prisma.interview.findFirst({ where: { id: interviewId, applicationId } });
    if (!interview) throw new AppError("Interview not found.", 404);
    const criteria = await prisma.scoringCriterion.findMany({ where: { active: true } });
    const scores: Record<string, number> = {};
    for (const criterion of criteria) {
      const value = Number(body[`score-${criterion.id}`]);
      if (!Number.isInteger(value) || value < 0 || value > criterion.maxScore) {
        throw new AppError(`Score ${criterion.name} from 0 to ${criterion.maxScore}.`);
      }
      scores[criterion.id] = value;
    }
    await prisma.interviewFeedback.upsert({
      where: { interviewId },
      create: {
        interviewId,
        scores,
        summary: String(body.summary ?? "").slice(0, 4000),
        internalNotes: String(body.internalNotes ?? "").slice(0, 4000),
        recommendation: String(body.recommendation ?? "").slice(0, 500),
      },
      update: {
        scores,
        summary: String(body.summary ?? "").slice(0, 4000),
        internalNotes: String(body.internalNotes ?? "").slice(0, 4000),
        recommendation: String(body.recommendation ?? "").slice(0, 500),
      },
    });
    await prisma.interview.update({ where: { id: interviewId }, data: { status: "COMPLETED" } });
    if (interview.type === "MOCK") {
      try {
        await adminSetStatus(actorId, applicationId, "MOCK_INTERVIEW_COMPLETED", "Mock interview feedback recorded.");
      } catch {
        /* status may already be further along */
      }
    }
    if (interview.type === "COMPANY") {
      try {
        await adminSetStatus(actorId, applicationId, "COMPANY_INTERVIEW_COMPLETED", "Company interview marked complete.");
      } catch {
        /* already moved */
      }
    }
    await audit(actorId, "interview.feedback", "Interview", interviewId);
    return;
  }

  if (action === "forward") {
    if (!application.consentToShare) throw new AppError("The student has not consented to share their profile.");
    await prisma.candidateSubmission.upsert({
      where: { applicationId },
      create: { applicationId, forwardedById: actorId, note: String(body.note ?? "").slice(0, 2000) },
      update: { note: String(body.note ?? "").slice(0, 2000) },
    });
    if (application.status !== "FORWARDED_TO_COMPANY") {
      await adminSetStatus(actorId, applicationId, "FORWARDED_TO_COMPANY", "Profile forwarded to the hiring company.");
    }
    await notify({
      userId: application.userId,
      type: "candidate_referral",
      title: "Profile forwarded",
      body: `Upskyla forwarded your profile for ${application.job.title}. The company decides the next step.`,
    });
    await audit(actorId, "application.forward", "Application", applicationId);
    return;
  }

  if (action === "outcome") {
    const outcome = String(body.outcome ?? "") as HiringOutcomeType;
    if (!["SELECTED", "REJECTED", "JOINED", "DECLINED"].includes(outcome)) throw new AppError("Choose a hiring outcome.");
    if (outcome === "JOINED" || outcome === "DECLINED") {
      const existing = await prisma.hiringOutcome.findUnique({ where: { applicationId } });
      const alreadySelected = application.status === "SELECTED" || existing?.outcome === "SELECTED" || existing?.outcome === "JOINED";
      if (!alreadySelected) throw new AppError("Record a selection before joining or a declined offer.");
    }
    await prisma.hiringOutcome.upsert({
      where: { applicationId },
      create: { applicationId, outcome, notes: String(body.notes ?? "").slice(0, 2000), recordedById: actorId },
      update: { outcome, notes: String(body.notes ?? "").slice(0, 2000), recordedById: actorId, recordedAt: new Date() },
    });
    if (outcome === "SELECTED") await adminSetStatus(actorId, applicationId, "SELECTED", "Company selected the candidate.");
    if (outcome === "REJECTED") {
      try {
        await adminSetStatus(actorId, applicationId, "REJECTED", "Company did not select the candidate.");
      } catch {
        await prisma.application.update({ where: { id: applicationId }, data: { status: "REJECTED" } });
      }
    }
    await notify({
      userId: application.userId,
      type: "hiring_result",
      title: "Hiring update",
      body:
        outcome === "JOINED"
          ? `Joining was recorded for ${application.job.title}.`
          : outcome === "SELECTED"
            ? `The company selected you for ${application.job.title}. This is not the same as a confirmed joining date.`
            : outcome === "DECLINED"
              ? `The offer for ${application.job.title} was recorded as declined.`
              : `The company did not select this application for ${application.job.title}.`,
    });
    await audit(actorId, "hiring.outcome", "Application", applicationId, { outcome });
    return;
  }

  throw new AppError("Unknown action.");
}
