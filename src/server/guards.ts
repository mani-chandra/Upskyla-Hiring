import "server-only";
import { auth } from "@/auth";
import { AppError } from "@/server/errors";
import { getPrisma } from "@/server/db";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    throw new AppError("Sign in to continue.", 401);
  }
  return session.user;
}

export async function requireStudent() {
  const user = await requireSession();
  if (user.role !== "STUDENT") throw new AppError("This area is for students.", 403);
  return user;
}

export async function requireAdmin() {
  const user = await requireSession();
  if (user.role !== "ADMIN") throw new AppError("This area is for administrators.", 403);
  return user;
}

export async function audit(actorId: string, action: string, entity: string, entityId?: string, metadata?: object) {
  const prisma = await getPrisma();
  await prisma.adminAuditLog.create({
    data: { actorId, action, entity, entityId, metadata: metadata ?? undefined },
  });
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}
