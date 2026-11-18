import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { formatDate, titleCase } from "@/lib/format";
import { activeEnrollment, dashboardUnlocked, nextOnboardingStep, onboardingSteps, profileChecks } from "@/server/profile";
import { currentStudent } from "@/server/current";
import { getVisibleJobs } from "@/server/eligibility";

export default async function StudentHome() {
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const unlocked = dashboardUnlocked(student);
  const next = nextOnboardingStep(student);
  const steps = onboardingSteps(student);
  const completion = profileChecks(student);
  const jobs = unlocked ? (await getVisibleJobs(student)).slice(0, 3) : [];
  const upcoming = unlocked
    ? student.applications.flatMap((application) =>
        application.interviews
          .filter((interview) => interview.status === "SCHEDULED")
          .map((interview) => ({ ...interview, title: application.job.title })),
      )
    : [];

  if (!enrollment) {
    return (
      <div className="mx-auto grid max-w-2xl gap-6">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-4xl">Choose a course to open your desk.</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            You are signed in, and the public site still works as before. Jobs, applications and interviews stay locked until you buy a preparation course and finish your profile.
          </p>
        </div>
        <section className="surface p-6">
          <h2 className="text-3xl">What happens next</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-7 text-muted">
            <li>1. Pick IT, Non-IT, or Combined and complete payment.</li>
            <li>2. Fill personal details, photo, education, resume and skills in Profile.</li>
            <li>3. Jobs and applications unlock when that checklist is done.</li>
          </ol>
          <Button asChild className="mt-6"><Link href="/student/profile#course">Choose a course</Link></Button>
        </section>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto grid max-w-3xl gap-6">
        <div>
          <p className="eyebrow">Get ready</p>
          <h1 className="mt-2 text-4xl">Finish your profile before openings unlock.</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Your {enrollment.course.name} enrollment is active. Complete the steps below in order. Everything lives under Profile — there are no separate pages for resume, education or skills.
          </p>
        </div>
        <section className="surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl">Checklist · {completion.percent}%</h2>
            <Badge tone="amber">Locked features wait</Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
            <div className="h-full bg-electric transition-all" style={{ width: `${completion.percent}%` }} />
          </div>
          <ol className="mt-6 grid gap-3">
            {steps.map((step, index) => (
              <li key={step.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${step.done ? "border-line bg-mist/60" : next?.id === step.id ? "border-electric bg-white" : "border-line bg-white"}`}>
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted">STEP {index + 1}</p>
                  <p className="mt-1 font-semibold">{step.label}</p>
                </div>
                {step.done ? (
                  <Badge tone="teal">Done</Badge>
                ) : (
                  <Button asChild size="sm"><Link href={step.href}>Continue</Link></Button>
                )}
              </li>
            ))}
          </ol>
          {next ? (
            <Button asChild className="mt-6"><Link href={next.href}>Continue with {next.label.toLowerCase()}</Link></Button>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 text-4xl">Hello, {student.name.split(" ")[0]}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {enrollment.course.name} is active and your profile is ready. Browse roles your course allows, track applications, and open interview links from here.
          </p>
        </div>
        <Button asChild variant="outline"><Link href="/student/profile">Edit profile</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Course", enrollment.course.name],
          ["Applications", String(student.applications.length)],
          ["Interviews", String(upcoming.length)],
        ].map(([label, value]) => (
          <article key={label} className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted">{label.toUpperCase()}</p>
            <p className="mt-2 text-2xl">{value}</p>
          </article>
        ))}
      </div>
      <section className="surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Open roles</h2>
          <Link href="/student/jobs" className="text-sm font-semibold text-electric">View all</Link>
        </div>
        <div className="mt-4 grid gap-3">
          {jobs.length === 0 ? <p className="text-sm text-muted">No published roles match your course yet.</p> : null}
          {jobs.map((job) => (
            <Link key={job.id} href={`/student/jobs/${job.id}`} className="rounded-2xl border border-line p-4">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-muted">{job.company.name} · {job.location} · Apply by {formatDate(job.applicationDeadline)}</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="text-2xl">Applications</h2>
          <div className="mt-3 grid gap-2">
            {student.applications.slice(0, 4).map((application) => (
              <Link key={application.id} href={`/student/applications/${application.id}`} className="text-sm hover:text-electric">
                {application.job.title} · {titleCase(application.status)}
              </Link>
            ))}
            {student.applications.length === 0 ? <p className="text-sm text-muted">You have not applied yet.</p> : null}
          </div>
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
    </div>
  );
}
