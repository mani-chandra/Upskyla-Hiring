import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@electric-sql/pglite",
    "pglite-prisma-adapter",
    "pg",
    "bcryptjs",
  ],
};

export default nextConfig;
