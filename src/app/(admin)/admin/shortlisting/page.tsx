import Link from "next/link";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";
import { titleCase } from "@/lib/format";

export default async function ShortlistingPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const rows = await prisma.application.findMany({
    where: { status: { in: ["MOCK_INTERVIEW_COMPLETED", "SHORTLISTED", "FORWARDED_TO_COMPANY"] } },
    include: { user: true, job: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-4xl">Shortlisting</h1>
      <p className="mt-2 text-sm text-muted">People ready for a decision, already shortlisted, or already forwarded.</p>
      <div className="mt-4 table-wrap surface">
        <table className="data">
          <thead><tr><th>Student</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.user.name}</td>
                <td><Link className="text-electric" href={`/admin/applications/${row.id}`}>{row.job.title}</Link></td>
                <td>{titleCase(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
