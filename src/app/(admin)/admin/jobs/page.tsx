import Link from "next/link";
import { titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";
import { Button } from "@/components/ui";

export default async function JobsAdminPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const jobs = await prisma.jobDescription.findMany({ include: { company: true, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl">Job descriptions</h1>
        <Button asChild><Link href="/admin/jobs/new">New vacancy</Link></Button>
      </div>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Applications</th></tr></thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td><Link className="font-semibold text-electric" href={`/admin/jobs/${job.id}`}>{job.title}</Link></td>
                <td>{job.company.name}</td>
                <td>{titleCase(job.status)}</td>
                <td>{job._count.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
