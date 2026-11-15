import "server-only";
import { getPrisma } from "@/server/db";
import { randomSecret } from "@/server/crypto";

const globalForBoot = globalThis as unknown as { boot?: Promise<void> };

async function ensureAuthSecret() {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) return;
  const prisma = await getPrisma();
  const existing = await prisma.systemSetting.findUnique({ where: { key: "auth_secret" } });
  if (existing?.value && existing.value.length >= 16) {
    process.env.AUTH_SECRET = existing.value;
    return;
  }
  const secret = randomSecret();
  try {
    await prisma.systemSetting.create({ data: { key: "auth_secret", value: secret } });
    process.env.AUTH_SECRET = secret;
  } catch {
    const row = await prisma.systemSetting.findUnique({ where: { key: "auth_secret" } });
    if (!row?.value) throw new Error("Could not prepare the session secret.");
    process.env.AUTH_SECRET = row.value;
  }
}

export function bootstrap() {
  if (!globalForBoot.boot) {
    globalForBoot.boot = ensureAuthSecret().catch((error) => {
      globalForBoot.boot = undefined;
      throw error;
    });
  }
  return globalForBoot.boot;
}
