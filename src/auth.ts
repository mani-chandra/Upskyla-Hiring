import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { getPrisma } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
});
