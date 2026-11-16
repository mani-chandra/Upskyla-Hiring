"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
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
      router.push(`/verify-email?userId=${status.userId}`);
      return;
    }
    if (status.state === "verify_phone" && status.userId) {
      router.push(`/verify-phone?userId=${status.userId}`);
      return;
    }
    if (!check.ok || status.state !== "ok") {
      setPending(false);
      setError(status.error ?? "Email or password is incorrect.");
      return;
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (result?.error) {
      setError("Email or password is incorrect.");
      return;
    }
    const next = params.get("next");
    router.push(next || (status.role === "ADMIN" ? "/admin" : "/student"));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="field">Email<input name="email" type="email" required /></label>
      <label className="field">Password<input name="password" type="password" required /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
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
