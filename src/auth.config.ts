import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  useSecureCookies: process.env.VERCEL === "1",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "STUDENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
