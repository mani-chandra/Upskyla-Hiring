"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

function loginErrorMessage(code: string | null) {
  if (!code) return "";
  if (code === "CredentialsSignin") return "Email or password is incorrect.";
  if (code === "Configuration") return "Sign-in is not configured. Set AUTH_SECRET in Vercel, then redeploy.";
  return "Could not start a session. Try again.";
}

function LoginForm() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const queryError = useMemo(() => loginErrorMessage(params.get("error")), [params]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      const check = await fetch("/api/login-status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const status = (await check.json()) as { state?: string; userId?: string; error?: string; role?: string };
      if (status.state === "verify_email" && status.userId) {
        window.location.assign(`/verify-email?userId=${status.userId}`);
        return;
      }
      if (status.state === "verify_phone" && status.userId) {
        window.location.assign(`/verify-phone?userId=${status.userId}`);
        return;
      }
      if (!check.ok || status.state !== "ok") {
        setError(status.error ?? "Email or password is incorrect.");
        setPending(false);
        return;
      }
      const next = params.get("next");
      const destination = next || (status.role === "ADMIN" ? "/admin" : "/");
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: destination });
      if (!result?.ok) {
        setError(loginErrorMessage(result?.error ?? "CredentialsSignin") || "Email or password is incorrect.");
        setPending(false);
        return;
      }
      window.location.assign(result.url || destination);
    } catch {
      setError("Could not reach the sign-in service. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="field">Email<input name="email" type="email" autoComplete="email" required /></label>
      <label className="field">Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {error || queryError ? <p className="text-sm text-red-700">{error || queryError}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Login"}</Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <p className="eyebrow">Student and admin</p>
        <h1 className="mt-2 text-4xl">Login</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Students sign in after email and phone are confirmed, then continue course, assessments and applications. Administrators use the account created during first-time setup. There is no employer login.</p>
        <div className="mt-6"><Suspense><LoginForm /></Suspense></div>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-electric">Forgot password</Link>
          <Link href="/register" className="text-electric">Register Now</Link>
        </div>
      </div>
    </main>
  );
}
