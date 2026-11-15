import Link from "next/link";
import { titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function ApplicationsAdmin({ searchParams }: { searchParams: Promise<{ job?: string; course?: string; skill?: string }> }) {
  await currentAdmin();
  const filters = await searchParams;
  const prisma = await getPrisma();
  const [jobs, skills, rows] = await Promise.all([
    prisma.jobDescription.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.application.findMany({
      where: {
        ...(filters.job ? { jobId: filters.job } : {}),
        ...(filters.course ? { user: { enrollments: { some: { status: "ACTIVE", course: { category: filters.course as "IT" | "NON_IT" | "COMBINED" } } } } } : {}),
        ...(filters.skill ? { user: { OR: [{ skills: { some: { skillId: filters.skill } } }, { verifiedSkills: { some: { skillId: filters.skill } } }] } } : {}),
      },
      include: { user: true, job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);
  return (
    <div>
      <h1 className="text-4xl">Applications</h1>
      <form className="mt-4 grid gap-3 md:grid-cols-4" action="/admin/applications">
        <select name="job" defaultValue={filters.job ?? ""}><option value="">All jobs</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select>
        <select name="course" defaultValue={filters.course ?? ""}><option value="">All courses</option><option value="IT">IT</option><option value="NON_IT">Non-IT</option><option value="COMBINED">Combined</option></select>
        <select name="skill" defaultValue={filters.skill ?? ""}><option value="">All skills</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>
        <button className="rounded-full bg-navy text-white" type="submit">Filter</button>
      </form>
      <div className="mt-4 table-wrap surface">
        <table className="data">
          <thead><tr><th>Student</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><Link className="text-electric" href={`/admin/students/${row.userId}`}>{row.user.name}</Link></td>
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
