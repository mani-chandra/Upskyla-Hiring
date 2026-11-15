import Link from "next/link";
import { formatDate, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function OutcomesPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const outcomes = await prisma.hiringOutcome.findMany({
    include: { application: { include: { user: true, job: { include: { company: true } } } } },
    orderBy: { recordedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-4xl">Hiring results</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Joined is the only outcome that means the person started work. Selected, rejected and declined are earlier or different decisions.</p>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>Student</th><th>Role</th><th>Company</th><th>Outcome</th><th>Recorded</th></tr></thead>
          <tbody>
            {outcomes.length === 0 ? <tr><td colSpan={5}>No hiring outcomes yet.</td></tr> : outcomes.map((outcome) => (
              <tr key={outcome.id}>
                <td>{outcome.application.user.name}</td>
                <td><Link className="text-electric" href={`/admin/applications/${outcome.applicationId}`}>{outcome.application.job.title}</Link></td>
                <td>{outcome.application.job.company.name}</td>
                <td>{titleCase(outcome.outcome)}</td>
                <td>{formatDate(outcome.recordedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
