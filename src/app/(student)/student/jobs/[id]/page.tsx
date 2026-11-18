import { notFound, redirect } from "next/navigation";
import { ApplyButton } from "@/components/student-actions";
import { Badge } from "@/components/ui";
import { formatDate, titleCase } from "@/lib/format";
import { currentStudent } from "@/server/current";
import { courseCanSeeCategory, eligibilityIssues, personFromStudent } from "@/server/eligibility";
import { activeEnrollment, dashboardUnlocked } from "@/server/profile";
import { getPrisma } from "@/server/db";

export default async function StudentJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await currentStudent();
  if (!dashboardUnlocked(student)) redirect("/student/profile");
  const enrollment = activeEnrollment(student);
  const prisma = await getPrisma();
  const job = await prisma.jobDescription.findFirst({
    where: { id, status: "PUBLISHED" },
    include: { company: true, requirements: { include: { skill: true } }, languages: { include: { language: true } }, eligibility: true },
  });
  if (!job || !enrollment || !courseCanSeeCategory(enrollment.course.category, job.category)) notFound();
  const person = personFromStudent(student);
  const issues = person ? eligibilityIssues(person, job, { forApply: true }) : ["Finish your profile first."];
  const existing = student.applications.find((item) => item.jobId === job.id && item.status !== "WITHDRAWN");
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <article className="surface p-6">
        <div className="flex gap-2">{job.company.isSample ? <Badge tone="amber">Sample</Badge> : null}<Badge>{job.category === "IT" ? "IT" : "Non-IT"}</Badge></div>
        <h1 className="mt-3 text-4xl">{job.title}</h1>
        <p className="mt-2 text-sm text-muted">{job.company.name} · {job.location}</p>
        <h2 className="mt-8 text-2xl">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{job.description}</p>
        <h2 className="mt-8 text-2xl">Responsibilities</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{job.responsibilities}</p>
      </article>
      <aside className="surface h-fit p-6 text-sm">
        <p>Salary · {job.salaryText}</p>
        <p className="mt-2">Type · {titleCase(job.employmentType)}</p>
        <p className="mt-2">Openings · {job.vacancies}</p>
        <p className="mt-2">Deadline · {formatDate(job.applicationDeadline)}</p>
        <p className="mt-2">Qualification · {job.qualification}</p>
        <p className="mt-2">Skills · {job.requirements.map((item) => item.skill.name).join(", ") || "None beyond the description"}</p>
        {existing ? <p className="mt-4 font-semibold">You already applied. Status: {titleCase(existing.status)}</p> : null}
        {issues.length && !existing ? (
          <ul className="mt-4 grid gap-2 text-amber">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        ) : null}
        {!existing && issues.length === 0 ? <div className="mt-4"><ApplyButton jobId={job.id} /></div> : null}
      </aside>
    </div>
  );
}
