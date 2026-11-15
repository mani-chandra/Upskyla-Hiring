"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { error?: string; devCode?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not start the reset.");
      return;
    }
    setDevCode(data.devCode ?? "");
    setMessage("If an account uses that email, a reset code is ready. When email delivery is configured, the code is sent and not shown here.");
  }

  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <h1 className="text-4xl">Forgot password</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="field">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm leading-6 text-muted">{message}</p> : null}
          {devCode ? <p className="rounded-xl bg-amber/10 p-3 text-sm text-amber">Email delivery is not configured. One-time reset code: {devCode}</p> : null}
          <Button type="submit">Send reset code</Button>
        </form>
        {email ? <Link className="mt-4 inline-block text-sm text-electric" href={`/reset-password?email=${encodeURIComponent(email)}`}>Enter the code</Link> : null}
      </div>
    </main>
  );
}
