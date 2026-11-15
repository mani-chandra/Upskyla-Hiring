import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { currentStudent } from "@/server/current";
import { eligibilityIssues, getVisibleJobs, personFromStudent } from "@/server/eligibility";

export default async function JobsPage() {
  const student = await currentStudent();
  const jobs = await getVisibleJobs(student);
  const person = personFromStudent(student);
  return (
    <div>
      <h1 className="text-4xl">Job opportunities</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">You only see roles your course is allowed to open. Other eligibility rules are checked again when you apply.</p>
      <div className="mt-6 grid gap-4">
        {jobs.length === 0 ? <p className="surface p-5 text-sm text-muted">No published roles match your course yet.</p> : null}
        {jobs.map((job) => {
          const issues = person ? eligibilityIssues(person, job, { forApply: true }) : ["Activate your course and finish your profile."];
          return (
            <Link key={job.id} href={`/student/jobs/${job.id}`} className="surface block p-5">
              <div className="flex flex-wrap gap-2">
                <Badge>{job.category === "IT" ? "IT" : "Non-IT"}</Badge>
                {job.company.isSample ? <Badge tone="amber">Sample</Badge> : null}
                {issues.length === 0 ? <Badge tone="teal">Ready to apply</Badge> : <Badge tone="line">Requirements open</Badge>}
              </div>
              <h2 className="mt-3 text-3xl">{job.title}</h2>
              <p className="mt-2 text-sm text-muted">{job.company.name} · {job.location} · {job.salaryText} · Deadline {formatDate(job.applicationDeadline)} · {job.vacancies} openings</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
