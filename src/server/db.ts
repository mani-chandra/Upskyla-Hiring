import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (typeof window !== "undefined") {
  throw new Error("Database access is only available on the server.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPromise?: Promise<PrismaClient>;
};

async function applyPgliteMigrations(db: {
  exec: (sql: string) => Promise<unknown>;
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
}) {
  await db.exec(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const dir = path.join(process.cwd(), "prisma", "migrations");
  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const name of entries) {
    const existing = await db.query("select name from schema_migrations where name = $1", [name]);
    if (existing.rows.length > 0) continue;
    const sql = await readFile(path.join(dir, name, "migration.sql"), "utf8");
    await db.exec(sql);
    await db.query("insert into schema_migrations (name) values ($1)", [name]);
  }
}

async function createPrisma() {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (databaseUrl !== "") {
    const adapter = new PrismaPg(databaseUrl);
    return new PrismaClient({ adapter });
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { PrismaPGlite } = await import("pglite-prisma-adapter");
  const dataDir = path.join(process.cwd(), "data", "pglite");
  await mkdir(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  await applyPgliteMigrations(client);
  const adapter = new PrismaPGlite(client);
  return new PrismaClient({ adapter });
}

export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createPrisma()
      .then(async (prisma) => {
        const { seedIfEmpty } = await import("@/server/seed");
        await seedIfEmpty(prisma);
        globalForPrisma.prisma = prisma;
        return prisma;
      })
      .catch((error) => {
        globalForPrisma.prismaPromise = undefined;
        throw error;
      });
  }
  return globalForPrisma.prismaPromise;
}
