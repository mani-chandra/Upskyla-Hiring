import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { clientIp } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { notifyAdmins } from "@/server/notifications";
import { rateLimit } from "@/server/rate-limit";

export const POST = api(async (req) => {
  await rateLimit(`inquire:${clientIp(req)}`, 5, 60 * 60 * 1000);
  const body = await readJson<Record<string, string>>(req);
  const name = String(body.name ?? "").trim();
  const hrEmail = String(body.hrEmail ?? "").trim().toLowerCase();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hrEmail)) throw new AppError("Enter the company and a valid HR email.");
  const prisma = await getPrisma();
  const company = await prisma.company.create({
    data: {
      name,
      industry: String(body.industry ?? "").trim() || "Not specified",
      website: String(body.website ?? "").trim() || null,
      location: String(body.location ?? "").trim() || "Not specified",
      hrName: String(body.hrName ?? "").trim() || "HR contact",
      hrEmail,
      hrPhone: String(body.hrPhone ?? "").trim() || "Not specified",
      partnershipStatus: "PROSPECT",
      internalNotes: String(body.note ?? "").slice(0, 4000),
      isSample: false,
    },
  });
  await notifyAdmins({
    type: "company_inquiry",
    title: "New company inquiry",
    body: `${company.name} asked to collaborate. Review the company profile before publishing a vacancy.`,
  });
  return ok({ message: "Upskyla has your request. An administrator will review it." }, 201);
});
