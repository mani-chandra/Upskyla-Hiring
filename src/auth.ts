import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { bootstrap } from "@/server/bootstrap";
import { getPrisma } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";

async function authOptions() {
  await bootstrap();
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is not available. Set it in the host environment.");
  }
  return {
    ...authConfig,
    secret,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          const email = String(credentials?.email ?? "").trim().toLowerCase();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;
          try {
            await rateLimit(`login:${email}`, 20, 15 * 60 * 1000);
          } catch {
            return null;
          }
          const prisma = await getPrisma();
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const matches = await bcrypt.compare(password, user.passwordHash);
          if (!matches) return null;
          if (user.role === "STUDENT" && (!user.emailVerified || !user.phoneVerified)) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        },
      }),
    ],
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
