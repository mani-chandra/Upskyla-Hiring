import Link from "next/link";
import { StudentFeatureGate } from "@/components/student-gate";
import { formatDate, titleCase } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function ApplicationsPage() {
  const student = await currentStudent();
  return (
    <StudentFeatureGate student={student} title="Applications unlock after your profile is complete">
      <div>
        <h1 className="text-4xl">Applications</h1>
        <div className="mt-6 table-wrap surface">
          <table className="data">
            <thead><tr><th>Role</th><th>Company</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {student.applications.length === 0 ? <tr><td colSpan={4}>You have not applied yet.</td></tr> : null}
              {student.applications.map((application) => (
                <tr key={application.id}>
                  <td><Link className="font-semibold text-electric" href={`/student/applications/${application.id}`}>{application.job.title}</Link></td>
                  <td>{application.job.company.name}</td>
                  <td>{titleCase(application.status)}</td>
                  <td>{formatDate(application.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StudentFeatureGate>
  );
}
