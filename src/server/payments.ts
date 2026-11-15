import "server-only";
import Razorpay from "razorpay";
import { getPrisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { hmacHex, safeEqual } from "@/server/crypto";
import { notify } from "@/server/notifications";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function razorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function activateEnrollment(paymentId: string, source: string, payload: object) {
  const prisma = await getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { enrollment: { include: { course: true, user: true } } },
  });
  if (!payment) throw new AppError("Payment not found.", 404);
  if (payment.status === "PAID") return payment;

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({ where: { id: paymentId }, include: { enrollment: true } });
    if (!current) throw new AppError("Payment not found.", 404);
    if (current.status === "PAID") return current;
    const otherActive = await tx.enrollment.findFirst({
      where: { userId: current.enrollment.userId, status: "ACTIVE", NOT: { id: current.enrollmentId } },
    });
    if (otherActive) throw new AppError("This student already has an active enrollment.");
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date() },
    });
    await tx.paymentEvent.create({
      data: { paymentId, type: source, payload },
    });
    await tx.enrollment.update({
      where: { id: current.enrollmentId },
      data: { status: "ACTIVE", activatedAt: new Date() },
    });
    await tx.enrollment.updateMany({
      where: { userId: current.enrollment.userId, status: "PENDING_PAYMENT", NOT: { id: current.enrollmentId } },
      data: { status: "CANCELLED" },
    });
    await tx.studentProfile.update({
      where: { userId: current.enrollment.userId },
      data: { onboardingStep: "personal" },
    });
    return current;
  });

  await notify({
    userId: payment.enrollment.userId,
    type: "payment_success",
    title: "Payment received",
    body: `Your payment for ${payment.enrollment.course.name} is verified. Your enrollment is now active.`,
  });
  await notify({
    userId: payment.enrollment.userId,
    type: "enrollment_active",
    title: "Enrollment active",
    body: `${payment.enrollment.course.name} is active. Continue with your personal details, education and resume.`,
  });
  return result;
}

export async function createOrder(userId: string, courseId: string) {
  const prisma = await getPrisma();
  const existingActive = await prisma.enrollment.findFirst({ where: { userId, status: "ACTIVE" } });
  if (existingActive) throw new AppError("You already have an active enrollment.");
  const course = await prisma.course.findFirst({
    where: { id: courseId, active: true },
    include: { pricing: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });
  const price = course?.pricing[0];
  if (!course || !price) throw new AppError("That course is not available.");
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, status: "PENDING_PAYMENT" },
    update: { status: "PENDING_PAYMENT" },
  });
  const amountPaise = price.offerPrice * 100;
  const client = razorpay();
  if (!client) {
    const payment = await prisma.payment.create({
      data: { enrollmentId: enrollment.id, provider: "DEMO", status: "CREATED", amountPaise, currency: "INR" },
    });
    return { mode: "demo" as const, paymentId: payment.id, amountPaise, courseName: course.name, currency: "INR" };
  }
  const payment = await prisma.payment.create({
    data: { enrollmentId: enrollment.id, provider: "RAZORPAY", status: "CREATED", amountPaise, currency: "INR" },
  });
  const order = await client.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: payment.id,
  });
  await prisma.payment.update({ where: { id: payment.id }, data: { razorpayOrderId: order.id } });
  return {
    mode: "razorpay" as const,
    paymentId: payment.id,
    orderId: order.id,
    amountPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    courseName: course.name,
  };
}

export async function verifyCheckout(input: { orderId: string; paymentId: string; signature: string }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new AppError("Razorpay is not configured.", 500);
  const expected = hmacHex(secret, `${input.orderId}|${input.paymentId}`);
  if (!safeEqual(expected, input.signature)) throw new AppError("Payment verification failed.", 400);
  const prisma = await getPrisma();
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment) throw new AppError("Payment not found.", 404);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { razorpayPaymentId: input.paymentId },
  });
  await activateEnrollment(payment.id, "checkout.verified", {
    orderId: input.orderId,
    paymentId: input.paymentId,
  });
}

export function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqual(hmacHex(secret, rawBody), signature);
}
