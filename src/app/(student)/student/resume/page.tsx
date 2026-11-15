import { UploadForm } from "@/components/student-actions";
import { formatDate } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function ResumePage() {
  const student = await currentStudent();
  const resume = student.resumes[0];
  return (
    <section className="surface max-w-2xl p-6">
      <h1 className="text-4xl">My resume</h1>
      <p className="mt-2 text-sm leading-6 text-muted">PDF or DOCX, up to 5 MB. The file is stored privately and downloaded only by you or an Upskyla administrator.</p>
      {resume ? (
        <p className="mt-4 text-sm">Current file: <a className="text-electric" href={`/api/files/${resume.file.id}`}>{resume.file.fileName}</a> · {formatDate(resume.file.createdAt)}</p>
      ) : <p className="mt-4 text-sm text-muted">No resume uploaded yet. Applications stay closed until one is on your profile.</p>}
      <div className="mt-6"><UploadForm url="/api/student/resume" accept=".pdf,.docx,application/pdf" label="Resume file" field="resume" /></div>
    </section>
  );
}
