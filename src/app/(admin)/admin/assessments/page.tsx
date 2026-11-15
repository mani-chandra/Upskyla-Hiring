import { JsonForm } from "@/components/json-form";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function AdminAssessmentsPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const [assessments, pending, skills] = await Promise.all([
    prisma.assessment.findMany({ include: { _count: { select: { questions: true, attempts: true } } } }),
    prisma.assessmentAnswer.findMany({ where: { reviewed: false }, include: { question: true, attempt: { include: { user: true, assessment: true } } }, take: 50 }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl">Assessments</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {assessments.map((assessment) => (
            <article key={assessment.id} className="surface p-4 text-sm">
              <h2 className="text-2xl">{assessment.title}</h2>
              <p className="text-muted">{assessment._count.questions} questions · {assessment._count.attempts} attempts</p>
            </article>
          ))}
        </div>
      </div>
      <section className="surface p-5">
        <h2 className="text-2xl">Add a multiple-choice question</h2>
        <div className="mt-4">
          <JsonForm url="/api/admin/questions" button="Add question">
            <label className="field">Assessment
              <select name="assessmentId">{assessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            </label>
            <label className="field">Prompt<textarea name="prompt" required /></label>
            <label className="field">Linked skill
              <select name="skillId"><option value="">None</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>
            </label>
            <label className="field">Correct option<input name="correct" required /></label>
            <label className="field">Other option<input name="wrongA" required /></label>
            <label className="field">Other option<input name="wrongB" required /></label>
          </JsonForm>
        </div>
      </section>
      <section className="grid gap-4">
        <h2 className="text-3xl">Coding answers awaiting review</h2>
        {pending.length === 0 ? <p className="text-sm text-muted">Nothing is waiting.</p> : pending.map((answer) => (
          <article key={answer.id} className="surface p-5 text-sm">
            <p className="font-semibold">{answer.attempt.user.name} · {answer.attempt.assessment.title}</p>
            <p className="mt-2">{answer.question.prompt}</p>
            <pre className="mt-3 overflow-auto rounded-xl bg-mist p-3 whitespace-pre-wrap">{String((answer.response as { text?: string }).text ?? "")}</pre>
            <div className="mt-3 max-w-xs">
              <JsonForm url="/api/admin/review" button="Save score">
                <input type="hidden" name="answerId" value={answer.id} />
                <label className="field">Points out of {answer.question.points}<input name="awarded" type="number" min={0} max={answer.question.points} required /></label>
              </JsonForm>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
