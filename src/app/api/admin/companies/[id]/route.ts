import { PartnershipStatus } from "@/generated/prisma/client";
import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const PUT = api(async (req, ctx) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const body = await readJson<Record<string, string>>(req);
  const status = String(body.partnershipStatus ?? "PROSPECT");
  if (!["PROSPECT", "ACTIVE", "PAUSED", "ENDED"].includes(status)) throw new AppError("Choose a partnership status.");
  const prisma = await getPrisma();
  await prisma.company.update({
    where: { id },
    data: {
      name: String(body.name ?? "").trim(),
      industry: String(body.industry ?? "").trim(),
      website: String(body.website ?? "").trim() || null,
      location: String(body.location ?? "").trim(),
      hrName: String(body.hrName ?? "").trim(),
      hrEmail: String(body.hrEmail ?? "").trim(),
      hrPhone: String(body.hrPhone ?? "").trim(),
      partnershipStatus: status as PartnershipStatus,
      internalNotes: String(body.internalNotes ?? "").slice(0, 4000) || null,
    },
  });
  await audit(admin.id, "company.update", "Company", id);
  return ok({ message: "Company saved." });
});
