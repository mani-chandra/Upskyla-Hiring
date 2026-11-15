import { JsonForm } from "@/components/json-form";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function SkillsAdminPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const [skills, criteria] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.scoringCriterion.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h1 className="text-4xl">Skills</h1>
        <ul className="mt-4 grid gap-2 text-sm">{skills.map((skill) => <li key={skill.id} className="surface px-4 py-3">{skill.name}</li>)}</ul>
        <div className="mt-4"><JsonForm url="/api/admin/skills" button="Add skill"><label className="field">Name<input name="name" required /></label></JsonForm></div>
      </section>
      <section>
        <h2 className="text-3xl">Mock interview criteria</h2>
        <ul className="mt-4 grid gap-2 text-sm">{criteria.map((item) => <li key={item.id} className="surface px-4 py-3">{item.name} · up to {item.maxScore}<p className="text-muted">{item.description}</p></li>)}</ul>
        <div className="mt-4">
          <JsonForm url="/api/admin/criteria" button="Add criterion">
            <label className="field">Name<input name="name" required /></label>
            <label className="field">Description<input name="description" required /></label>
            <label className="field">Max score<input name="maxScore" type="number" defaultValue={5} /></label>
          </JsonForm>
        </div>
      </section>
    </div>
  );
}
