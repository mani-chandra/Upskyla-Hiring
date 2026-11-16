import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/marketing";
import { Badge, Button } from "@/components/ui";
import { formatDate, titleCase } from "@/lib/format";
import { getPrisma } from "@/server/db";

export const metadata: Metadata = { title: "Role" };

export default async function CareerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getPrisma();
  const job = await prisma.jobDescription.findFirst({
    where: { id, status: "PUBLISHED" },
    include: { company: true, requirements: { include: { skill: true } }, languages: { include: { language: true } }, eligibility: true },
  });
  if (!job) notFound();
  return (
    <main>
      <PageIntro
        eyebrow={job.category === "IT" ? "IT role" : "Non-IT role"}
        title={job.title}
        lede={`${job.company.name} · ${job.location} · ${job.vacancies} ${job.vacancies === 1 ? "opening" : "openings"} · ${titleCase(job.employmentType)}. Read the role here. Applying still requires a matching course, a complete profile, and consent to share it.`}
      />
      <div className="container py-12">
      <div className="flex flex-wrap gap-2">
        <Badge>{job.category === "IT" ? "IT" : "Non-IT"}</Badge>
        {job.company.isSample ? <Badge tone="amber">Sample vacancy</Badge> : null}
      </div>
      {job.company.isSample ? <p className="mt-4 max-w-2xl text-sm leading-6 text-amber">This company is sample data so you can see a vacancy. It is not a claim that Upskyla has a partnership with a real employer of this name.</p> : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="surface p-6 text-sm leading-7">
          <h2 className="text-2xl">The role</h2>
          <p className="mt-3 whitespace-pre-wrap text-muted">{job.description}</p>
          <h2 className="mt-8 text-2xl">Responsibilities</h2>
          <p className="mt-3 whitespace-pre-wrap text-muted">{job.responsibilities}</p>
        </article>
        <aside className="surface h-fit p-6 text-sm">
          <p><span className="text-muted">Salary · </span>{job.salaryText}</p>
          <p className="mt-2"><span className="text-muted">Qualification · </span>{job.qualification}</p>
          <p className="mt-2"><span className="text-muted">Experience · </span>{job.experience}</p>
          <p className="mt-2"><span className="text-muted">Deadline · </span>{formatDate(job.applicationDeadline)}</p>
          <p className="mt-2"><span className="text-muted">Skills · </span>{job.requirements.map((item) => item.skill.name).join(", ") || "Listed in the description"}</p>
          <Button asChild className="mt-6 w-full"><Link href="/register">Register to apply</Link></Button>
        </aside>
      </div>
      </div>
    </main>
  );
}
