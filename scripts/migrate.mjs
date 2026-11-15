import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim() ?? "";
if (url === "") {
  console.log("migrate: DATABASE_URL unset, skip");
  process.exit(0);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
