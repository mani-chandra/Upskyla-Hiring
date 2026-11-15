import { inrFromPaise } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function AdminHome() {
  await currentAdmin();
  const prisma = await getPrisma();
  const [students, active, it, nonIt, combined, revenue, published, applications, mocks, shortlisted, forwarded, selections] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE", course: { category: "IT" } } }),
    prisma.enrollment.count({ where: { status: "ACTIVE", course: { category: "NON_IT" } } }),
    prisma.enrollment.count({ where: { status: "ACTIVE", course: { category: "COMBINED" } } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true } }),
    prisma.jobDescription.findMany({ where: { status: "PUBLISHED" }, select: { vacancies: true } }),
    prisma.application.count(),
    prisma.interview.count({ where: { type: "MOCK", status: "SCHEDULED" } }),
    prisma.application.count({ where: { status: "SHORTLISTED" } }),
    prisma.candidateSubmission.count(),
    prisma.application.count({ where: { OR: [{ status: "SELECTED" }, { outcome: { outcome: { in: ["SELECTED", "JOINED"] } } }] } }),
  ]);
  const cards = [
    ["Registered students", students],
    ["Active enrollments", active],
    ["IT enrollments", it],
    ["Non-IT enrollments", nonIt],
    ["Combined enrollments", combined],
    ["Revenue", inrFromPaise(revenue._sum.amountPaise ?? 0)],
    ["Active vacancies", published.reduce((sum, job) => sum + job.vacancies, 0)],
    ["Applications", applications],
    ["Pending mock interviews", mocks],
    ["Shortlisted", shortlisted],
    ["Forwarded to companies", forwarded],
    ["Final selections", selections],
  ];
  return (
    <div>
      <h1 className="text-4xl">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Selections count company decisions. They are not the same as joining. Joining is recorded only as a hiring outcome.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={String(label)} className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted">{String(label).toUpperCase()}</p>
            <p className="mt-2 text-3xl">{value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
