import { StudentFeatureGate } from "@/components/student-gate";
import { formatDateTime, titleCase } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function InterviewsPage() {
  const student = await currentStudent();
  const interviews = student.applications.flatMap((application) => application.interviews.map((interview) => ({ ...interview, title: application.job.title })));
  return (
    <StudentFeatureGate student={student} title="Interviews unlock after your profile is complete">
      <div>
        <h1 className="text-4xl">Interviews</h1>
        <p className="mt-2 text-sm text-muted">Mock and company interviews appear here. Scores and internal notes stay with Upskyla.</p>
        <div className="mt-6 grid gap-3">
          {interviews.length === 0 ? <p className="surface p-5 text-sm">No interviews yet.</p> : interviews.map((interview) => (
            <article key={interview.id} className="surface p-5 text-sm">
              <p className="font-semibold">{interview.title}</p>
              <p className="mt-1 text-muted">{titleCase(interview.type)} · {titleCase(interview.status)} · {formatDateTime(interview.scheduledAt)}</p>
              {interview.meetingLink ? <a className="text-electric" href={interview.meetingLink}>Open meeting link</a> : null}
            </article>
          ))}
        </div>
      </div>
    </StudentFeatureGate>
  );
}
