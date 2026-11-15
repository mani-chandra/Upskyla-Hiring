import Link from "next/link";
import { currentStudent } from "@/server/current";
import { activeEnrollment } from "@/server/profile";
import { getPrisma } from "@/server/db";
import { formatDate } from "@/lib/format";

export default async function AssessmentsPage() {
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const prisma = await getPrisma();
  const assessments = enrollment
    ? await prisma.assessment.findMany({ where: { appliesTo: { has: enrollment.course.category } }, orderBy: { title: "asc" } })
    : [];
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl">Assessments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">These tests are scored separately from the skills you reported. Coding answers are reviewed by an administrator and are not run on the server.</p>
      </div>
      {!enrollment ? <p className="surface p-5 text-sm">Activate a course before starting an assessment.</p> : null}
      <div className="grid gap-4">
        {assessments.map((assessment) => {
          const attempts = student.attempts.filter((attempt) => attempt.assessmentId === assessment.id);
          const latest = attempts[0];
          return (
            <article key={assessment.id} className="surface p-5">
              <h2 className="text-2xl">{assessment.title}</h2>
              <p className="mt-2 text-sm text-muted">{assessment.summary}</p>
              <p className="mt-2 text-sm">{latest ? `Latest score ${latest.score} of ${latest.maxScore}${latest.pendingReview ? " · coding review pending" : ""} · ${formatDate(latest.submittedAt)}` : "Not attempted yet"}</p>
              <Link href={`/student/assessments/${assessment.id}`} className="mt-3 inline-block text-sm font-semibold text-electric">Open assessment</Link>
            </article>
          );
        })}
      </div>
      <section className="surface p-5">
        <h2 className="text-2xl">History</h2>
        <div className="mt-3 grid gap-2">
          {student.attempts.length === 0 ? <p className="text-sm text-muted">No attempts yet.</p> : student.attempts.map((attempt) => (
            <p key={attempt.id} className="text-sm">{attempt.assessment.title} · {attempt.score}/{attempt.maxScore} · {formatDate(attempt.submittedAt)}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
