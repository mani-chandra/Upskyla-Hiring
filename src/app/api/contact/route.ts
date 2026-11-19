import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { clientIp } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { notifyAdmins } from "@/server/notifications";
import { rateLimit } from "@/server/rate-limit";
import { normalizePhone } from "@/server/profile";

export const POST = api(async (req) => {
  await rateLimit(`contact:${clientIp(req)}`, 8, 60 * 60 * 1000);
  const body = await readJson<{
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  }>(req);
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const phoneRaw = String(body.phone ?? "").trim();
  if (name.length < 2) throw new AppError("Enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Enter a valid email address.");
  if (subject.length < 3) throw new AppError("Enter a short subject.");
  if (message.length < 10) throw new AppError("Tell us a bit more in your message.");
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (phoneRaw && !phone) throw new AppError("Enter a valid Indian mobile number, or leave phone blank.");

  const prisma = await getPrisma();
  const inquiry = await prisma.contactInquiry.create({
    data: {
      name,
      email,
      phone,
      subject: subject.slice(0, 160),
      message: message.slice(0, 4000),
    },
  });
  await notifyAdmins({
    type: "contact_inquiry",
    title: "New contact inquiry",
    body: `${name} wrote about “${inquiry.subject}”. Reply to ${email}.`,
  });
  return ok({ message: "Thanks. Upskyla has your query and an administrator will follow up." }, 201);
});
