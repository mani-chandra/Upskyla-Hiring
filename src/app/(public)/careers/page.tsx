import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/marketing";
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
    <main>
      <PageIntro
        eyebrow="Career opportunities"
        title="Vacancies Upskyla is ready to screen for."
        lede="You can read open roles here before you have an account. Applying needs a student login, an active course that matches the role, a finished profile and resume, and consent to share that profile with the hiring company. Records marked sample are demonstration data, not established partnerships."
        imageSrc="/images/section-interview.jpg"
        imageAlt="Professional hiring conversation"
      />
      <div className="container grid gap-4 py-12">
        {jobs.length === 0 ? <p className="surface p-6 text-sm text-muted">No vacancies are published right now.</p> : null}
        {jobs.map((job) => (
          <Link key={job.id} href={`/careers/${job.id}`} className="surface card-hover block p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{job.category === "IT" ? "IT" : "Non-IT"}</Badge>
              {job.company.isSample ? <Badge tone="amber">Sample</Badge> : null}
            </div>
            <h2 className="mt-3 text-3xl">{job.title}</h2>
            <p className="mt-2 text-sm text-muted">{job.company.name} · {job.location} · {titleCase(job.employmentType)} · Apply by {formatDate(job.applicationDeadline)}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{job.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
