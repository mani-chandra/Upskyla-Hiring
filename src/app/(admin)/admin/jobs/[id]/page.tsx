import { notFound } from "next/navigation";
import { JobEditor } from "@/components/job-editor";
import { JsonForm } from "@/components/json-form";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";
import { loadJob } from "@/server/jobs";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await currentAdmin();
  const { id } = await params;
  const prisma = await getPrisma();
  const [job, companies, skills, languages] = await Promise.all([
    prisma.jobDescription.findUnique({ where: { id }, include: { requirements: true, languages: true, eligibility: true, company: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!job) notFound();
  const full = await loadJob(id);
  const { countMatches } = await import("@/server/eligibility");
  const matches = await countMatches(full);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <JobEditor companies={companies} skills={skills} languages={languages} job={job} />
      <aside className="surface h-fit p-5">
        <p className="text-sm text-muted">Students who currently match</p>
        <p className="mt-2 text-5xl">{matches}</p>
        <p className="mt-2 text-sm text-muted">Publishing notifies these students. Course category rules still apply on top of the checkboxes.</p>
        <div className="mt-4 grid gap-3">
          <JsonForm url={`/api/admin/jobs/${job.id}/status`} button="Publish"><input type="hidden" name="status" value="PUBLISHED" /></JsonForm>
          <JsonForm url={`/api/admin/jobs/${job.id}/status`} button="Close"><input type="hidden" name="status" value="CLOSED" /></JsonForm>
          <JsonForm url={`/api/admin/jobs/${job.id}/status`} button="Archive"><input type="hidden" name="status" value="ARCHIVED" /></JsonForm>
        </div>
      </aside>
    </div>
  );
}
