import { NextResponse } from "next/server";
import { bootstrap } from "@/server/bootstrap";
import { getPrisma } from "@/server/db";
import { activateEnrollment, verifyWebhook } from "@/server/payments";

export async function POST(req: Request) {
  await bootstrap();
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  const event = JSON.parse(raw) as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  const orderId = event.payload?.payment?.entity?.order_id;
  const paymentId = event.payload?.payment?.entity?.id;
  if (event.event === "payment.captured" && orderId) {
    const prisma = await getPrisma();
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (payment) {
      if (paymentId) await prisma.payment.update({ where: { id: payment.id }, data: { razorpayPaymentId: paymentId } });
      await activateEnrollment(payment.id, event.event, { orderId });
    }
  }
  return NextResponse.json({ ok: true });
}
