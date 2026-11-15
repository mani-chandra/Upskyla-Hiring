import { notFound } from "next/navigation";
import { formatDate, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getStudentBundle, profileChecks } from "@/server/profile";

export default async function AdminStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await currentAdmin();
  const { id } = await params;
  const student = await getStudentBundle(id);
  if (!student || student.role !== "STUDENT") notFound();
  const completion = profileChecks(student);
  return (
    <div className="grid gap-6">
      <div className="flex items-start gap-4">
        {student.profile?.photoFileId ? <img src={`/api/files/${student.profile.photoFileId}`} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : null}
        <div>
          <h1 className="text-4xl">{student.name}</h1>
          <p className="text-sm text-muted">{student.email} · {student.phone} · Profile {completion.percent}%</p>
        </div>
      </div>
      <section className="surface p-5 text-sm leading-6">
        <h2 className="text-2xl">Personal and education</h2>
        <p className="mt-2">{student.profile?.address} · {student.profile?.currentLocation} · DOB {formatDate(student.profile?.dateOfBirth)}</p>
        <p>{student.education ? `${student.education.degree}, ${student.education.branch}, ${student.education.college}, ${student.education.graduationYear}` : "Education not added."}</p>
        <p>{student.resumes[0] ? <a className="text-electric" href={`/api/files/${student.resumes[0].file.id}`}>Download resume</a> : "No resume."}</p>
      </section>
      <section className="surface p-5 text-sm">
        <h2 className="text-2xl">Self-reported skills</h2>
        <p className="mt-2">{student.skills.map((item) => `${item.skill.name} (${item.proficiency.toLowerCase()})`).join(", ") || "None"}</p>
        <h2 className="mt-4 text-2xl">Verified skills</h2>
        <p className="mt-2">{student.verifiedSkills.map((item) => `${item.skill.name} ${item.score}%`).join(", ") || "None"}</p>
        <h2 className="mt-4 text-2xl">Assessment attempts</h2>
        {student.attempts.map((attempt) => <p key={attempt.id} className="mt-1">{attempt.assessment.title}: {attempt.score}/{attempt.maxScore}</p>)}
      </section>
      <section className="surface p-5 text-sm">
        <h2 className="text-2xl">Applications</h2>
        {student.applications.map((application) => (
          <p key={application.id} className="mt-2"><a className="text-electric" href={`/admin/applications/${application.id}`}>{application.job.title}</a> · {titleCase(application.status)}</p>
        ))}
      </section>
    </div>
  );
}
