import { formatDateTime, inrFromPaise, titleCase } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function PaymentsPage() {
  const student = await currentStudent();
  const payments = student.enrollments.flatMap((enrollment) => enrollment.payments.map((payment) => ({ ...payment, course: enrollment.course.name })));
  return (
    <div>
      <h1 className="text-4xl">Payments</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">A demonstration payment is labeled DEMO and does not collect money. Razorpay payments are marked RAZORPAY only after the server verifies the signature.</p>
      <div className="mt-6 table-wrap surface">
        <table className="data">
          <thead><tr><th>Course</th><th>Provider</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {payments.length === 0 ? <tr><td colSpan={5}>No payments yet.</td></tr> : payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.course}</td>
                <td>{payment.provider === "DEMO" ? "Demonstration" : "Razorpay"}</td>
                <td>{titleCase(payment.status)}</td>
                <td>{inrFromPaise(payment.amountPaise)}</td>
                <td>{formatDateTime(payment.paidAt ?? payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
