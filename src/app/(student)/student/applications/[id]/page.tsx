import { notFound } from "next/navigation";
import { JsonForm } from "@/components/json-form";
import { formatDateTime, titleCase } from "@/lib/format";
import { currentStudent } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await currentStudent();
  const prisma = await getPrisma();
  const application = await prisma.application.findFirst({
    where: { id, userId: student.id },
    include: {
      job: { include: { company: { select: { name: true } } } },
      history: { orderBy: { createdAt: "asc" } },
      interviews: { select: { id: true, type: true, scheduledAt: true, meetingLink: true, status: true } },
      outcome: { select: { outcome: true, notes: true } },
    },
  });
  if (!application) notFound();
  const canWithdraw = ["APPLIED", "UNDER_REVIEW", "MOCK_INTERVIEW_SCHEDULED", "MOCK_INTERVIEW_COMPLETED", "SHORTLISTED", "ON_HOLD"].includes(application.status);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl">{application.job.title}</h1>
        <p className="mt-2 text-sm text-muted">{application.job.company.name} · {titleCase(application.status)}</p>
        {application.outcome ? <p className="mt-2 text-sm">Hiring outcome recorded by the company process: {titleCase(application.outcome.outcome)}. {application.outcome.notes}</p> : null}
      </div>
      <section className="surface p-5">
        <h2 className="text-2xl">Status history</h2>
        <ol className="mt-3 grid gap-2">
          {application.history.map((item) => (
            <li key={item.id} className="text-sm">{formatDateTime(item.createdAt)} · {titleCase(item.toStatus)}{item.note ? ` · ${item.note}` : ""}</li>
          ))}
        </ol>
      </section>
      <section className="surface p-5">
        <h2 className="text-2xl">Interviews</h2>
        {application.interviews.length === 0 ? <p className="mt-2 text-sm text-muted">None scheduled. Internal scoring notes are not shown here.</p> : application.interviews.map((interview) => (
          <p key={interview.id} className="mt-2 text-sm">{titleCase(interview.type)} · {titleCase(interview.status)} · {formatDateTime(interview.scheduledAt)} {interview.meetingLink ? <a className="text-electric" href={interview.meetingLink}>Meeting link</a> : null}</p>
        ))}
      </section>
      {canWithdraw ? (
        <section className="max-w-sm">
          <JsonForm url={`/api/student/applications/${application.id}/withdraw`} button="Withdraw application" redirect="/student/applications">
            <p className="text-sm text-muted">You can withdraw before Upskyla forwards your profile.</p>
          </JsonForm>
        </section>
      ) : null}
    </div>
  );
}
