import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatDate, titleCase } from "@/lib/format";
import { activeEnrollment, profileChecks } from "@/server/profile";
import { currentStudent } from "@/server/current";
import { getVisibleJobs } from "@/server/eligibility";

export default async function StudentHome() {
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const completion = profileChecks(student);
  const jobs = (await getVisibleJobs(student)).slice(0, 3);
  const upcoming = student.applications.flatMap((application) =>
    application.interviews.filter((interview) => interview.status === "SCHEDULED").map((interview) => ({ ...interview, title: application.job.title })),
  );
  const verified = student.verifiedSkills.length;
  const attempts = new Set(student.attempts.map((attempt) => attempt.assessmentId)).size;
  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-2 text-4xl">Hello, {student.name.split(" ")[0]}.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Your course, assessments and applications stay in one place. A shortlist is not a job offer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Profile", `${completion.percent}%`],
          ["Course", enrollment?.course.name ?? "Not enrolled"],
          ["Assessments", `${attempts} submitted`],
          ["Applications", String(student.applications.length)],
        ].map(([label, value]) => (
          <article key={label} className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted">{label.toUpperCase()}</p>
            <p className="mt-2 text-2xl">{value}</p>
          </article>
        ))}
      </div>
      <section className="surface p-5">
        <h2 className="text-2xl">Profile completion</h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
          <div className="h-full bg-electric" style={{ width: `${completion.percent}%` }} />
        </div>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {completion.checks.map((check) => (
            <li key={check.label} className="text-sm text-muted">{check.done ? "Done" : "Still needed"} · {check.label}</li>
          ))}
        </ul>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Verified skills</h2>
            <Badge tone="teal">{verified}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{verified ? student.verifiedSkills.map((item) => item.skill.name).join(", ") : "Verified skills appear after a scored assessment. They stay separate from skills you report yourself."}</p>
        </section>
        <section className="surface p-5">
          <h2 className="text-2xl">Upcoming interviews</h2>
          <div className="mt-3 grid gap-2">
            {upcoming.length === 0 ? <p className="text-sm text-muted">Nothing is scheduled.</p> : upcoming.map((item) => (
              <p key={item.id} className="text-sm">{item.title} · {titleCase(item.type)} · {formatDate(item.scheduledAt)}</p>
            ))}
          </div>
        </section>
      </div>
      <section className="surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Latest job opportunities</h2>
          <Link href="/student/jobs" className="text-sm font-semibold text-electric">View all</Link>
        </div>
        <div className="mt-4 grid gap-3">
          {!enrollment ? <p className="text-sm text-muted">Activate a course to see roles you are allowed to open.</p> : null}
          {jobs.map((job) => (
            <Link key={job.id} href={`/student/jobs/${job.id}`} className="rounded-2xl border border-line p-4">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-muted">{job.company.name} · {job.location} · Apply by {formatDate(job.applicationDeadline)}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="surface p-5">
        <h2 className="text-2xl">Application status</h2>
        <div className="mt-3 grid gap-2">
          {student.applications.slice(0, 4).map((application) => (
            <p key={application.id} className="text-sm">{application.job.title} · {titleCase(application.status)}</p>
          ))}
          {student.applications.length === 0 ? <p className="text-sm text-muted">You have not applied yet.</p> : null}
        </div>
      </section>
      <section className="surface p-5">
        <h2 className="text-2xl">Recent notifications</h2>
        <div className="mt-3 grid gap-2">
          {student.notifications.slice(0, 4).map((notice) => (
            <p key={notice.id} className="text-sm"><span className="font-semibold">{notice.title}.</span> {notice.body}</p>
          ))}
          {student.notifications.length === 0 ? <p className="text-sm text-muted">You are up to date.</p> : null}
        </div>
      </section>
    </div>
  );
}
