import { PartnershipStatus } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

function companyData(body: Record<string, string>) {
  const status = String(body.partnershipStatus ?? "PROSPECT");
  if (!["PROSPECT", "ACTIVE", "PAUSED", "ENDED"].includes(status)) throw new AppError("Choose a partnership status.");
  return {
    name: String(body.name ?? "").trim(),
    industry: String(body.industry ?? "").trim(),
    website: String(body.website ?? "").trim() || null,
    location: String(body.location ?? "").trim(),
    hrName: String(body.hrName ?? "").trim(),
    hrEmail: String(body.hrEmail ?? "").trim(),
    hrPhone: String(body.hrPhone ?? "").trim(),
    partnershipStatus: status as PartnershipStatus,
    internalNotes: String(body.internalNotes ?? "").slice(0, 4000) || null,
  };
}

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<Record<string, string>>(req);
  const data = companyData(body);
  if (!data.name || !data.hrEmail) throw new AppError("Company name and HR email are required.");
  const prisma = await getPrisma();
  const company = await prisma.company.create({ data });
  await audit(admin.id, "company.create", "Company", company.id);
  return ok({ id: company.id }, 201);
});
