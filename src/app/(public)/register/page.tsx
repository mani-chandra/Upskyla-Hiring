"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = (await response.json()) as { error?: string; userId?: string; devEmailCode?: string };
    setPending(false);
    if (!response.ok || !data.userId) {
      setError(data.error ?? "Could not create the account.");
      return;
    }
    const code = data.devEmailCode ? `&devEmailCode=${encodeURIComponent(data.devEmailCode)}` : "";
    router.push(`/verify-email?userId=${data.userId}${code}`);
  }

  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <p className="eyebrow">Students</p>
        <h1 className="mt-2 text-4xl">Register Now</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Create your account with your name, email and mobile number. You will confirm both before choosing a course.</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="field">Full name<input name="name" required /></label>
          <label className="field">Email<input name="email" type="email" required /></label>
          <label className="field">Phone<input name="phone" required placeholder="10-digit mobile" /></label>
          <label className="field">Password<input name="password" type="password" required /></label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</Button>
        </form>
        <p className="mt-4 text-sm">Already registered? <Link href="/login" className="text-electric">Login</Link></p>
      </div>
    </main>
  );
}
