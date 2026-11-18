import Link from "next/link";
import { JsonForm } from "@/components/json-form";
import { PayButton, UploadForm } from "@/components/student-actions";
import { Badge, Button } from "@/components/ui";
import { dateInputValue, formatDate, inr } from "@/lib/format";
import { listCourses } from "@/server/catalog";
import { currentStudent } from "@/server/current";
import { getPrisma } from "@/server/db";
import { activeEnrollment, nextOnboardingStep, onboardingSteps } from "@/server/profile";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const languageLevels = ["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT"];
const soft = ["BASIC", "WORKING", "STRONG", "EXPERT"];

function Section({
  id,
  title,
  done,
  focus,
  children,
}: {
  id: string;
  title: string;
  done?: boolean;
  focus?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`surface scroll-mt-24 p-6 ${focus ? "ring-2 ring-electric/40" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-3xl">{title}</h2>
        {done === undefined ? null : done ? <Badge tone="teal">Done</Badge> : focus ? <Badge tone="amber">Next</Badge> : <Badge tone="line">Needed</Badge>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProfilePage() {
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const courses = await listCourses();
  const pending = student.enrollments.find((item) => item.status === "PENDING_PAYMENT");
  const steps = onboardingSteps(student);
  const next = nextOnboardingStep(student);
  const profile = student.profile;
  const education = student.education;
  const resume = student.resumes[0];
  const technical = enrollment?.course.category === "IT" || enrollment?.course.category === "COMBINED";
  const prisma = await getPrisma();
  const [skills, languages, assessments] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
    enrollment
      ? prisma.assessment.findMany({ where: { appliesTo: { has: enrollment.course.category } }, orderBy: { title: "asc" } })
      : Promise.resolve([]),
  ]);
  const selected = new Map(student.skills.map((item) => [item.skillId, item.proficiency]));
  const spoken = new Map(student.languages.map((item) => [item.languageId, item.proficiency]));
  const stepDone = Object.fromEntries(steps.map((step) => [step.id, step.done]));

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 text-4xl">One place for course, details and skills.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Fill these sections in order after you buy a course. Jobs and applications unlock when the checklist is complete. Scored assessments stay here too.
        </p>
      </div>

      <aside className="surface p-5">
        <p className="text-sm font-semibold">Priority checklist</p>
        <ol className="mt-3 grid gap-2">
          {steps.map((step, index) => (
            <li key={step.id}>
              <a href={step.href} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm ${next?.id === step.id ? "bg-electric/10 text-navy" : "text-muted hover:bg-mist"}`}>
                <span>{index + 1}. {step.label}</span>
                <span>{step.done ? "Done" : next?.id === step.id ? "Next" : ""}</span>
              </a>
            </li>
          ))}
        </ol>
        {next ? (
          <Button asChild className="mt-4 w-full" size="sm"><Link href={next.href}>Continue</Link></Button>
        ) : (
          <p className="mt-4 text-sm text-teal">Profile complete. Jobs are unlocked from Home.</p>
        )}
      </aside>

      <Section id="course" title="Course" done={stepDone.course} focus={next?.id === "course"}>
        {enrollment ? (
          <div>
            <Badge tone="teal">Active</Badge>
            <p className="mt-3 text-xl font-semibold">{enrollment.course.name}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{enrollment.course.description}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-muted">Pick one track. Enrollment becomes active only after payment is confirmed.</p>
            {courses.map((course) => (
              <article key={course.slug} className="rounded-2xl border border-line p-4">
                <h3 className="text-2xl">{course.name}</h3>
                <p className="mt-2 text-sm text-muted">{course.summary}</p>
                <p className="mt-3 text-sm text-muted line-through">{inr(course.originalPrice)}</p>
                <p className="text-2xl text-navy">{inr(course.offerPrice)}</p>
                {pending?.course.slug === course.slug ? <p className="mt-2 text-sm text-amber">Payment is still pending for this course.</p> : null}
                <div className="mt-3 max-w-sm"><PayButton courseId={course.id} /></div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {!enrollment ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
          Personal details, photo, education, resume and skills unlock on this page after your course payment is confirmed.
        </p>
      ) : (
        <>
          <Section id="personal" title="Personal details" done={stepDone.personal} focus={next?.id === "personal"}>
            <p className="mb-4 text-sm text-muted">Email {student.email} · Phone {student.phone}</p>
            <JsonForm url="/api/student/profile" button="Save personal details">
              <label className="field">Full name<input name="name" defaultValue={student.name} required /></label>
              <label className="field">Date of birth<input name="dateOfBirth" type="date" defaultValue={dateInputValue(profile?.dateOfBirth)} required /></label>
              <label className="field">Address<textarea name="address" rows={3} defaultValue={profile?.address ?? ""} required /></label>
              <label className="field">Current location<input name="currentLocation" defaultValue={profile?.currentLocation ?? ""} required /></label>
            </JsonForm>
          </Section>

          <Section id="photo" title="Photograph" done={stepDone.photo} focus={next?.id === "photo"}>
            {profile?.photoFileId ? (
              <img src={`/api/files/${profile.photoFileId}`} alt="" className="mb-4 h-28 w-28 rounded-2xl object-cover" />
            ) : (
              <p className="mb-4 text-sm text-muted">Add a clear headshot. JPG or PNG, under 2 MB.</p>
            )}
            <UploadForm url="/api/student/photo" accept="image/png,image/jpeg" label="Photograph" field="photo" />
          </Section>

          <Section id="education" title="Education" done={stepDone.education} focus={next?.id === "education"}>
            <JsonForm url="/api/student/education" button="Save education">
              <label className="field">College<input name="college" defaultValue={education?.college ?? ""} required /></label>
              <label className="field">Degree<input name="degree" defaultValue={education?.degree ?? ""} required /></label>
              <label className="field">Branch<input name="branch" defaultValue={education?.branch ?? ""} required /></label>
              <label className="field">Graduation year<input name="graduationYear" type="number" defaultValue={education?.graduationYear ?? ""} required /></label>
              <label className="field">Academic details<textarea name="academicDetails" rows={4} defaultValue={education?.academicDetails ?? ""} /></label>
            </JsonForm>
          </Section>

          <Section id="resume" title="Resume" done={stepDone.resume} focus={next?.id === "resume"}>
            <p className="mb-4 text-sm text-muted">PDF or DOCX, up to 5 MB. Stored privately for you and Upskyla administrators.</p>
            {resume ? (
              <p className="mb-4 text-sm">Current file: <a className="text-electric" href={`/api/files/${resume.file.id}`}>{resume.file.fileName}</a> · {formatDate(resume.file.createdAt)}</p>
            ) : null}
            <UploadForm url="/api/student/resume" accept=".pdf,.docx,application/pdf" label="Resume file" field="resume" />
          </Section>

          <Section
            id="skills"
            title="Skills"
            done={Boolean(stepDone.workplace && (!technical || stepDone.technical))}
            focus={next?.id === "technical" || next?.id === "workplace"}
          >
            <p className="mb-4 text-sm text-muted">Self-reported skills stay separate from verified scores after assessments.</p>
            {technical ? (
              <div className="mb-8">
                <h3 className="text-xl font-semibold">Technical self-assessment</h3>
                <div className="mt-3">
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
              </div>
            ) : null}
            <h3 className="text-xl font-semibold">Languages and workplace skills</h3>
            <div className="mt-3">
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
            {student.verifiedSkills.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold">Verified skills</h3>
                <div className="mt-2 grid gap-2">
                  {student.verifiedSkills.map((item) => (
                    <p key={item.id} className="text-sm text-muted">{item.skill.name} · {item.level.toLowerCase()} · {item.score}%</p>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>

          <Section id="assessments" title="Assessments">
            <p className="mb-4 text-sm text-muted">Optional scored tests for your course. Coding answers are reviewed by an admin and are not executed.</p>
            <div className="grid gap-3">
              {assessments.length === 0 ? <p className="text-sm text-muted">No assessments are attached to your course yet.</p> : null}
              {assessments.map((assessment) => {
                const latest = student.attempts.find((attempt) => attempt.assessmentId === assessment.id);
                return (
                  <article key={assessment.id} className="rounded-2xl border border-line p-4">
                    <h3 className="text-xl font-semibold">{assessment.title}</h3>
                    <p className="mt-1 text-sm text-muted">{assessment.summary}</p>
                    <p className="mt-2 text-sm">
                      {latest
                        ? `Latest ${latest.score}/${latest.maxScore}${latest.pendingReview ? " · review pending" : ""} · ${formatDate(latest.submittedAt)}`
                        : "Not attempted yet"}
                    </p>
                    <Link href={`/student/assessments/${assessment.id}`} className="mt-2 inline-block text-sm font-semibold text-electric">
                      Open assessment
                    </Link>
                  </article>
                );
              })}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
