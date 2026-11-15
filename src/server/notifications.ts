import "server-only";
import { getPrisma } from "@/server/db";

type Notice = {
  userId: string;
  type: string;
  title: string;
  body: string;
};

function integrations() {
  return {
    resend: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    msg91: Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID && process.env.MSG91_SENDER_ID),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  };
}

export function integrationStatus() {
  return integrations();
}

export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return "skipped_unconfigured";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  return response.ok ? "sent" : "failed";
}

export async function sendOtpSms(phone: string, otp: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const sender = process.env.MSG91_SENDER_ID;
  if (!authKey || !templateId || !sender) return "skipped_unconfigured" as const;
  const mobiles = phone.replace(/\D/g, "");
  const response = await fetch("https://control.msg91.com/api/v5/flow", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      sender,
      short_url: "0",
      recipients: [{ mobiles, OTP: otp }],
    }),
  });
  return response.ok ? ("sent" as const) : ("failed" as const);
}

export async function notify(input: Notice) {
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { notificationPreference: true },
  });
  if (!user) return;
  const emailAllowed = user.notificationPreference?.emailEnabled !== false;
  let emailStatus = "skipped_preference";
  if (emailAllowed) {
    emailStatus = await sendEmail(user.email, input.title, input.body);
  }
  if (user.notificationPreference?.inAppEnabled === false) return;
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: input.type,
      title: input.title,
      body: input.body,
      emailStatus,
    },
  });
}

export async function notifyAdmins(input: Omit<Notice, "userId">) {
  const prisma = await getPrisma();
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  for (const admin of admins) {
    await notify({ ...input, userId: admin.id });
  }
}
