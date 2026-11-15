"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get("userId") ?? "";
  const initialCode = params.get("devEmailCode") ?? "";
  const [error, setError] = useState("");
  const [info, setInfo] = useState(initialCode ? "Email delivery is not configured, so your one-time code is shown here." : "Enter the code sent to your email.");
  const [code, setCode] = useState("");

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, code }),
    });
    const data = (await response.json()) as { error?: string; devPhoneCode?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not verify the email.");
      return;
    }
    const extra = data.devPhoneCode ? `&devPhoneCode=${encodeURIComponent(data.devPhoneCode)}` : "";
    router.push(`/verify-phone?userId=${userId}${extra}`);
  }

  async function resend() {
    const response = await fetch("/api/resend-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, type: "email" }),
    });
    const data = (await response.json()) as { error?: string; devCode?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not send a new code.");
      return;
    }
    setInfo(data.devCode ? `Email delivery is not configured. Your one-time code is ${data.devCode}.` : "A new code has been sent.");
  }

  return (
    <form onSubmit={verify} className="grid gap-4">
      <p className="text-sm leading-6 text-muted">{info}</p>
      {initialCode ? <p className="rounded-xl bg-amber/10 p-3 text-sm text-amber">One-time email code: {initialCode}</p> : null}
      <label className="field">Verification code<input value={code} onChange={(event) => setCode(event.target.value)} required /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit">Confirm email</Button>
      <button type="button" className="text-sm text-electric" onClick={resend}>Resend code</button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <p className="eyebrow">Email verification</p>
        <h1 className="mt-2 text-4xl">Confirm your email</h1>
        <div className="mt-6"><Suspense><VerifyEmailForm /></Suspense></div>
      </div>
    </main>
  );
}
