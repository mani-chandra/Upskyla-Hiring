import { formatDateTime, inrFromPaise, titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function AdminPaymentsPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const payments = await prisma.payment.findMany({ include: { enrollment: { include: { user: true, course: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="text-4xl">Payments</h1>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>Student</th><th>Course</th><th>Provider</th><th>Status</th><th>Amount</th><th>When</th></tr></thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.enrollment.user.name}</td>
                <td>{payment.enrollment.course.name}</td>
                <td>{payment.provider === "DEMO" ? "Demonstration" : "Razorpay"}</td>
                <td>{titleCase(payment.status)}</td>
                <td>{inrFromPaise(payment.amountPaise)}</td>
                <td>{formatDateTime(payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
