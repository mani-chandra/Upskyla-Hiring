import Link from "next/link";
import { formatDateTime, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function InterviewsAdminPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const interviews = await prisma.interview.findMany({
    include: { interviewer: true, application: { include: { user: true, job: true } } },
    orderBy: { scheduledAt: "asc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="text-4xl">Interviews</h1>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>When</th><th>Type</th><th>Student</th><th>Interviewer</th><th>Status</th></tr></thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview.id}>
                <td>{formatDateTime(interview.scheduledAt)}</td>
                <td>{titleCase(interview.type)}</td>
                <td><Link className="text-electric" href={`/admin/applications/${interview.applicationId}`}>{interview.application.user.name}</Link></td>
                <td>{interview.interviewer?.name ?? "—"}</td>
                <td>{titleCase(interview.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
