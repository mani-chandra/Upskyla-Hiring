import { notFound } from "next/navigation";
import { JsonForm } from "@/components/json-form";
import { formatDateTime, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";
import { canAdminTransition } from "@/server/applications";

export default async function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  const { id } = await params;
  const prisma = await getPrisma();
  const [application, criteria, admins] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        job: { include: { company: true } },
        history: { orderBy: { createdAt: "asc" } },
        interviews: { include: { feedback: true, interviewer: true } },
        submission: true,
        outcome: true,
      },
    }),
    prisma.scoringCriterion.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true } }),
  ]);
  if (!application) notFound();
  const next = (["UNDER_REVIEW", "MOCK_INTERVIEW_SCHEDULED", "MOCK_INTERVIEW_COMPLETED", "SHORTLISTED", "REJECTED", "ON_HOLD", "COMPANY_INTERVIEW_SCHEDULED", "COMPANY_INTERVIEW_COMPLETED", "SELECTED"] as const)
    .filter((status) => canAdminTransition(application.status, status));
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl">{application.user.name}</h1>
        <p className="text-sm text-muted">{application.job.title} at {application.job.company.name} · {titleCase(application.status)} · Consent {application.consentToShare ? "given" : "missing"}</p>
        <a className="text-sm text-electric" href={`/admin/students/${application.userId}`}>Open full profile and scores</a>
      </div>
      <section className="surface p-5 text-sm">
        <h2 className="text-2xl">History</h2>
        {application.history.map((item) => <p key={item.id} className="mt-2">{formatDateTime(item.createdAt)} · {titleCase(item.toStatus)} {item.note ? `· ${item.note}` : ""}</p>)}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="text-2xl">Move status</h2>
          <JsonForm url={`/api/admin/applications/${application.id}`} button="Update status">
            <input type="hidden" name="action" value="status" />
            <label className="field">Next status
              <select name="status">{next.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}</select>
            </label>
            <label className="field">Note<input name="note" /></label>
          </JsonForm>
        </section>
        <section className="surface p-5">
          <h2 className="text-2xl">Internal note</h2>
          <p className="text-sm text-muted">Students never see this note.</p>
          <JsonForm url={`/api/admin/applications/${application.id}`} button="Save note">
            <input type="hidden" name="action" value="note" />
            <textarea name="internalNotes" rows={4} defaultValue={application.internalNotes ?? ""} />
          </JsonForm>
        </section>
        <section className="surface p-5">
          <h2 className="text-2xl">Schedule interview</h2>
          <JsonForm url={`/api/admin/applications/${application.id}`} button="Schedule">
            <input type="hidden" name="action" value="schedule" />
            <label className="field">Type
              <select name="type" defaultValue="MOCK"><option value="MOCK">Mock</option><option value="COMPANY">Company</option></select>
            </label>
            <label className="field">When<input type="datetime-local" name="scheduledAt" required /></label>
            <label className="field">Interviewer
              <select name="interviewerId" defaultValue={admin.id}>{admins.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
            </label>
            <label className="field">Meeting link<input name="meetingLink" placeholder="https://" /></label>
          </JsonForm>
        </section>
        <section className="surface p-5">
          <h2 className="text-2xl">Forward to company</h2>
          <JsonForm url={`/api/admin/applications/${application.id}`} button="Forward profile">
            <input type="hidden" name="action" value="forward" />
            <label className="field">Note to the file<input name="note" /></label>
          </JsonForm>
          {application.submission ? <p className="mt-3 text-sm">Forwarded {formatDateTime(application.submission.forwardedAt)}</p> : null}
        </section>
        <section className="surface p-5">
          <h2 className="text-2xl">Hiring outcome</h2>
          <p className="text-sm text-muted">Selected is the company’s decision. Joined is recorded only when the person actually starts. Declined means they did not take the offer.</p>
          <JsonForm url={`/api/admin/applications/${application.id}`} button="Record outcome">
            <input type="hidden" name="action" value="outcome" />
            <select name="outcome">{["SELECTED", "REJECTED", "JOINED", "DECLINED"].map((item) => <option key={item}>{item}</option>)}</select>
            <textarea name="notes" rows={3} placeholder="What the company decided" />
          </JsonForm>
          {application.outcome ? <p className="mt-3 text-sm">Current outcome: {titleCase(application.outcome.outcome)}</p> : null}
        </section>
      </div>
      <section className="grid gap-4">
        <h2 className="text-3xl">Interview feedback</h2>
        {application.interviews.map((interview) => (
          <article key={interview.id} className="surface p-5">
            <p className="text-sm">{titleCase(interview.type)} · {formatDateTime(interview.scheduledAt)} · {interview.interviewer?.name ?? "Unassigned"}</p>
            {interview.meetingLink ? <a className="text-sm text-electric" href={interview.meetingLink}>Meeting link</a> : null}
            <div className="mt-3">
              <JsonForm url={`/api/admin/applications/${application.id}`} button="Save feedback">
                <input type="hidden" name="action" value="feedback" />
                <input type="hidden" name="interviewId" value={interview.id} />
                {criteria.map((criterion) => (
                  <label key={criterion.id} className="field">{criterion.name} (0-{criterion.maxScore})
                    <input name={`score-${criterion.id}`} type="number" min={0} max={criterion.maxScore} required />
                  </label>
                ))}
                <label className="field">Summary shown only inside admin<textarea name="summary" required /></label>
                <label className="field">Internal notes<textarea name="internalNotes" /></label>
                <label className="field">Recommendation<input name="recommendation" /></label>
              </JsonForm>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
