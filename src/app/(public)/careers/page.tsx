import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatDate, titleCase } from "@/lib/format";
import { getPrisma } from "@/server/db";

export const metadata: Metadata = { title: "Career opportunities" };

export default async function CareersPage() {
  const prisma = await getPrisma();
  const jobs = await prisma.jobDescription.findMany({
    where: { status: "PUBLISHED" },
    include: { company: true },
    orderBy: { publishedAt: "desc" },
  });
  return (
    <main className="container py-16">
      <p className="eyebrow">Career opportunities</p>
      <h1 className="mt-3 max-w-3xl text-5xl">Vacancies Upskyla is ready to screen for.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">You can read open roles here. Applying requires a student account, an active course that matches the role, a finished profile and consent to share that profile. Records marked sample are demonstration data, not established partnerships.</p>
      <div className="mt-8 grid gap-4">
        {jobs.length === 0 ? <p className="surface p-6 text-sm text-muted">No vacancies are published right now.</p> : null}
        {jobs.map((job) => (
          <Link key={job.id} href={`/careers/${job.id}`} className="surface block p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{job.category === "IT" ? "IT" : "Non-IT"}</Badge>
              {job.company.isSample ? <Badge tone="amber">Sample</Badge> : null}
            </div>
            <h2 className="mt-3 text-3xl">{job.title}</h2>
            <p className="mt-2 text-sm text-muted">{job.company.name} · {job.location} · {titleCase(job.employmentType)} · Apply by {formatDate(job.applicationDeadline)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
