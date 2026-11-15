import { formatDate, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function EnrollmentsPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const rows = await prisma.enrollment.findMany({ include: { user: true, course: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="text-4xl">Enrollments</h1>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>Student</th><th>Course</th><th>Status</th><th>Activated</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}><td>{row.user.name}</td><td>{row.course.name}</td><td>{titleCase(row.status)}</td><td>{formatDate(row.activatedAt)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
