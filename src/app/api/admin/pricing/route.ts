import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { audit, requireAdmin } from "@/server/guards";
import { getPrisma } from "@/server/db";

export const POST = api(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ courseId: string; originalPrice: string; offerPrice: string; label: string }>(req);
  const originalPrice = Number(body.originalPrice);
  const offerPrice = Number(body.offerPrice);
  if (!body.courseId || offerPrice < 1 || originalPrice < offerPrice) throw new AppError("The offer must be at least ₹1 and not above the original price.");
  const prisma = await getPrisma();
  await prisma.coursePricing.updateMany({ where: { courseId: body.courseId, active: true }, data: { active: false } });
  await prisma.coursePricing.create({
    data: { courseId: body.courseId, originalPrice, offerPrice, label: body.label || "New Batch Offer", active: true },
  });
  await audit(admin.id, "pricing.update", "Course", body.courseId, { offerPrice });
  return ok({ message: "Price updated." });
});
