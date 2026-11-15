import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { activateEnrollment, razorpayConfigured } from "@/server/payments";

export const POST = api(async (req) => {
  const student = await requireStudent();
  if (razorpayConfigured()) throw new AppError("Razorpay is configured. Use the live checkout.", 404);
  const body = await readJson<{ paymentId: string }>(req);
  const prisma = await getPrisma();
  const payment = await prisma.payment.findFirst({
    where: { id: body.paymentId, provider: "DEMO", enrollment: { userId: student.id } },
  });
  if (!payment) throw new AppError("Demonstration payment not found.", 404);
  await activateEnrollment(payment.id, "demo.confirmed", { demonstration: true });
  return ok();
});
