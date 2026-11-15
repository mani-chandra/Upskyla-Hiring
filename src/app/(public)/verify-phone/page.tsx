"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

function VerifyPhoneForm() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get("userId") ?? "";
  const initialCode = params.get("devPhoneCode") ?? "";
  const [error, setError] = useState("");
  const [info, setInfo] = useState(initialCode ? "SMS delivery is not configured, so your one-time code is shown here." : "Enter the code sent to your phone.");
  const [code, setCode] = useState("");

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/verify-phone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, code }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not verify the phone.");
      return;
    }
    router.push("/login?verified=1");
  }

  async function resend() {
    const response = await fetch("/api/resend-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, type: "phone" }),
    });
    const data = (await response.json()) as { error?: string; devCode?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not send a new code.");
      return;
    }
    setInfo(data.devCode ? `SMS delivery is not configured. Your one-time code is ${data.devCode}.` : "A new code has been sent.");
  }

  return (
    <form onSubmit={verify} className="grid gap-4">
      <p className="text-sm leading-6 text-muted">{info}</p>
      {initialCode ? <p className="rounded-xl bg-amber/10 p-3 text-sm text-amber">One-time phone code: {initialCode}</p> : null}
      <label className="field">Verification code<input value={code} onChange={(event) => setCode(event.target.value)} required /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit">Confirm phone</Button>
      <button type="button" className="text-sm text-electric" onClick={resend}>Resend code</button>
    </form>
  );
}

export default function VerifyPhonePage() {
  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <p className="eyebrow">Phone verification</p>
        <h1 className="mt-2 text-4xl">Confirm your phone</h1>
        <div className="mt-6"><Suspense><VerifyPhoneForm /></Suspense></div>
      </div>
    </main>
  );
}
