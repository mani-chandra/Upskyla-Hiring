import { JsonForm } from "@/components/json-form";
import { currentStudent } from "@/server/current";
import { activeEnrollment } from "@/server/profile";
import { getPrisma } from "@/server/db";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const languageLevels = ["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT"];
const soft = ["BASIC", "WORKING", "STRONG", "EXPERT"];

export default async function SkillsPage() {
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const technical = enrollment?.course.category === "IT" || enrollment?.course.category === "COMBINED";
  const prisma = await getPrisma();
  const [skills, languages] = await Promise.all([prisma.skill.findMany({ orderBy: { name: "asc" } }), prisma.language.findMany({ orderBy: { name: "asc" } })]);
  const selected = new Map(student.skills.map((item) => [item.skillId, item.proficiency]));
  const spoken = new Map(student.languages.map((item) => [item.languageId, item.proficiency]));
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl">My skills</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">What you select here is self-reported. Scores from assessments are stored separately as verified skills.</p>
      </div>
      {technical ? (
        <section className="surface p-6">
          <h2 className="text-3xl">Technical self-assessment</h2>
          <div className="mt-4">
            <JsonForm url="/api/student/skills" button="Save technical skills">
              <div className="grid gap-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="grid gap-2 md:grid-cols-[1fr_180px] md:items-center">
                    <label className="flex items-center gap-2 text-sm font-normal">
                      <input className="w-auto" type="checkbox" name="skillId" value={skill.id} defaultChecked={selected.has(skill.id)} />
                      {skill.name}
                    </label>
                    <select name={`level-${skill.id}`} defaultValue={selected.get(skill.id) ?? "BEGINNER"}>
                      {levels.map((level) => <option key={level} value={level}>{level.toLowerCase()}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </JsonForm>
          </div>
        </section>
      ) : <p className="surface p-5 text-sm text-muted">Technical self-assessment is for IT and combined courses. {enrollment ? "Your course does not include it." : "Activate a course first."}</p>}
      <section className="surface p-6">
        <h2 className="text-3xl">Languages and workplace skills</h2>
        <div className="mt-4">
          <JsonForm url="/api/student/languages" button="Save languages and workplace skills">
            {languages.map((language) => (
              <div key={language.id} className="grid gap-2 md:grid-cols-[1fr_200px] md:items-center">
                <label className="flex items-center gap-2 text-sm font-normal">
                  <input className="w-auto" type="checkbox" name="languageId" value={language.id} defaultChecked={spoken.has(language.id)} />
                  {language.name}
                </label>
                <select name={`level-${language.id}`} defaultValue={spoken.get(language.id) ?? "BASIC"}>
                  {languageLevels.map((level) => <option key={level} value={level}>{level.toLowerCase()}</option>)}
                </select>
              </div>
            ))}
            {([
              ["communicationSkill", "Communication", student.profile?.communicationSkill],
              ["teamworkSkill", "Teamwork", student.profile?.teamworkSkill],
              ["problemSolvingSkill", "Problem solving", student.profile?.problemSolvingSkill],
              ["customerHandlingSkill", "Customer handling", student.profile?.customerHandlingSkill],
            ] as const).map(([name, label, value]) => (
              <label key={name} className="field">{label}
                <select name={name} defaultValue={value ?? "BASIC"}>
                  {soft.map((level) => <option key={level} value={level}>{level.toLowerCase()}</option>)}
                </select>
              </label>
            ))}
          </JsonForm>
        </div>
      </section>
      <section className="surface p-6">
        <h2 className="text-3xl">Verified skills</h2>
        <div className="mt-3 grid gap-2">
          {student.verifiedSkills.length === 0 ? <p className="text-sm text-muted">None yet.</p> : student.verifiedSkills.map((item) => (
            <p key={item.id} className="text-sm">{item.skill.name} · {item.level.toLowerCase()} · {item.score}%</p>
          ))}
        </div>
      </section>
    </div>
  );
}
