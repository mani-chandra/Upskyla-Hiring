import "server-only";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { hashToken, randomCode } from "@/server/crypto";
import { notify, sendEmail, sendOtpSms } from "@/server/notifications";
import { normalizePhone } from "@/server/profile";
import { rateLimit } from "@/server/rate-limit";

const TEN_MINUTES = 10 * 60 * 1000;

async function issueCode(userId: string, type: "email" | "phone" | "password_reset") {
  const prisma = await getPrisma();
  const code = randomCode(6);
  await prisma.verificationToken.updateMany({
    where: { userId, type, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await prisma.verificationToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(code),
      expiresAt: new Date(Date.now() + TEN_MINUTES),
    },
  });
  return code;
}

export async function registerStudent(input: { name: string; email: string; phone: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);
  const name = input.name.trim();
  if (name.length < 2) throw new AppError("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email address.");
  if (!phone) throw new AppError("Enter a valid 10-digit Indian mobile number.");
  if (input.password.length < 8 || !/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    throw new AppError("Use a password of at least 8 characters with a letter and a number.");
  }
  await rateLimit(`register:${email}`, 5, 60 * 60 * 1000);
  const prisma = await getPrisma();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) throw new AppError("An account already uses that email or phone.");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "STUDENT",
      profile: { create: { onboardingStep: "course" } },
      notificationPreference: { create: {} },
    },
  });
  const emailCode = await issueCode(user.id, "email");
  const phoneCode = await issueCode(user.id, "phone");
  const emailStatus = await sendEmail(
    email,
    "Confirm your Upskyla email",
    `Your Upskyla email verification code is ${emailCode}. It expires in 10 minutes.`,
  );
  const smsStatus = await sendOtpSms(phone, phoneCode);
  await notify({
    userId: user.id,
    type: "registration",
    title: "Welcome to Upskyla",
    body: "Your account is created. Confirm your email and phone, then choose a course.",
  });
  return {
    userId: user.id,
    devEmailCode: emailStatus === "skipped_unconfigured" ? emailCode : undefined,
    devPhoneCode: smsStatus === "skipped_unconfigured" ? phoneCode : undefined,
    emailDelivered: emailStatus === "sent",
    phoneDelivered: smsStatus === "sent",
  };
}

export async function resendCode(userId: string, type: "email" | "phone") {
  await rateLimit(`resend:${userId}:${type}`, 5, 15 * 60 * 1000);
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "STUDENT") throw new AppError("Account not found.", 404);
  const code = await issueCode(user.id, type);
  if (type === "email") {
    const status = await sendEmail(user.email, "Confirm your Upskyla email", `Your Upskyla email verification code is ${code}. It expires in 10 minutes.`);
    return { devCode: status === "skipped_unconfigured" ? code : undefined, delivered: status === "sent" };
  }
  if (!user.phone) throw new AppError("Add a phone number first.");
  const status = await sendOtpSms(user.phone, code);
  return { devCode: status === "skipped_unconfigured" ? code : undefined, delivered: status === "sent" };
}

async function consume(userId: string, type: string, code: string) {
  const prisma = await getPrisma();
  const token = await prisma.verificationToken.findFirst({
    where: { userId, type, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.expiresAt.getTime() < Date.now()) throw new AppError("That code has expired. Request a new one.");
  if (token.attempts >= 5) throw new AppError("Too many incorrect attempts. Request a new code.");
  if (token.tokenHash !== hashToken(code.trim())) {
    await prisma.verificationToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } });
    throw new AppError("That code is incorrect.");
  }
  await prisma.verificationToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
}

export async function verifyEmail(userId: string, code: string) {
  await rateLimit(`verify-email:${userId}`, 10, 15 * 60 * 1000);
  await consume(userId, "email", code);
  const prisma = await getPrisma();
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
}

export async function verifyPhone(userId: string, code: string) {
  await rateLimit(`verify-phone:${userId}`, 10, 15 * 60 * 1000);
  await consume(userId, "phone", code);
  const prisma = await getPrisma();
  await prisma.user.update({ where: { id: userId }, data: { phoneVerified: new Date() } });
}

export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  await rateLimit(`reset:${normalized}`, 5, 15 * 60 * 1000);
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return { devCode: undefined as string | undefined };
  const code = await issueCode(user.id, "password_reset");
  const status = await sendEmail(
    user.email,
    "Reset your Upskyla password",
    `Your Upskyla password reset code is ${code}. It expires in 10 minutes. If you did not ask for this, ignore the message.`,
  );
  return { userId: user.id, devCode: status === "skipped_unconfigured" ? code : undefined };
}

export async function resetPassword(email: string, code: string, password: string) {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError("Use a password of at least 8 characters with a letter and a number.");
  }
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new AppError("That code is incorrect.");
  await consume(user.id, "password_reset", code);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
}

export async function createFirstAdmin(input: { name: string; email: string; password: string }) {
  const prisma = await getPrisma();
  const existing = await prisma.user.count({ where: { role: "ADMIN" } });
  if (existing > 0) throw new AppError("An administrator already exists.", 404);
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (name.length < 2) throw new AppError("Enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email address.");
  if (input.password.length < 8 || !/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    throw new AppError("Use a password of at least 8 characters with a letter and a number.");
  }
  await rateLimit("setup-admin", 5, 60 * 60 * 1000);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "ADMIN",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      notificationPreference: { create: {} },
    },
  });
}
