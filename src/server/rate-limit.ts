import "server-only";
import { getPrisma } from "@/server/db";
import { AppError } from "@/server/errors";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const prisma = await getPrisma();
  const bucket = Math.floor(Date.now() / windowMs);
  const row = await prisma.rateLimitBucket.upsert({
    where: { key_bucket: { key, bucket } },
    create: { key, bucket, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (row.count > limit) {
    throw new AppError("Too many attempts. Wait a few minutes and try again.", 429);
  }
}
