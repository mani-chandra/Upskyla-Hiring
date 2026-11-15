import { JobEditor } from "@/components/job-editor";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function NewJobPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const [companies, skills, languages] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-4xl">New job description</h1>
      <JobEditor companies={companies} skills={skills} languages={languages} job={null} />
    </div>
  );
}
