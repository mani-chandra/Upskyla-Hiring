import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function ReportsPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const [applications, referrals, interviews, selected, joined, rejected, withdrawn] = await Promise.all([
    prisma.application.count(),
    prisma.candidateSubmission.count(),
    prisma.interview.count(),
    prisma.hiringOutcome.count({ where: { outcome: "SELECTED" } }),
    prisma.hiringOutcome.count({ where: { outcome: "JOINED" } }),
    prisma.hiringOutcome.count({ where: { outcome: "REJECTED" } }),
    prisma.application.count({ where: { status: "WITHDRAWN" } }),
  ]);
  const rows = [
    ["Applications", applications, "Submitted by students"],
    ["Referrals", referrals, "Profiles forwarded to a company"],
    ["Interviews", interviews, "Mock and company interviews"],
    ["Selections", selected, "Company selected the candidate"],
    ["Joined", joined, "The only count that means someone started"],
    ["Rejected by company", rejected, "Recorded hiring outcome"],
    ["Withdrawn", withdrawn, "Student withdrew before forwarding"],
  ];
  return (
    <div>
      <h1 className="text-4xl">Reports</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">These numbers are counted from records. Upskyla does not turn a shortlist or an interview into a placement.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(([label, value, note]) => (
          <article key={String(label)} className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted">{String(label).toUpperCase()}</p>
            <p className="mt-2 text-4xl">{value}</p>
            <p className="mt-2 text-sm text-muted">{note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
