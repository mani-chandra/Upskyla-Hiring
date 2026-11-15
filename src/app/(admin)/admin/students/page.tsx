import Link from "next/link";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await currentAdmin();
  const { q } = await searchParams;
  const prisma = await getPrisma();
  const query = q?.trim() ?? "";
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : {}),
    },
    include: { enrollments: { where: { status: "ACTIVE" }, include: { course: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="text-4xl">Students</h1>
      <form className="mt-4 max-w-sm" action="/admin/students">
        <input name="q" defaultValue={query} placeholder="Search name or email" />
      </form>
      <div className="mt-4 table-wrap surface">
        <table className="data">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Course</th></tr></thead>
          <tbody>
            {students.length === 0 ? <tr><td colSpan={4}>No students match.</td></tr> : students.map((student) => (
              <tr key={student.id}>
                <td><Link className="font-semibold text-electric" href={`/admin/students/${student.id}`}>{student.name}</Link></td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.enrollments[0]?.course.name ?? "Not enrolled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
