"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not reset the password.");
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="field">Email<input name="email" type="email" defaultValue={params.get("email") ?? ""} required /></label>
      <label className="field">Reset code<input name="code" required /></label>
      <label className="field">New password<input name="password" type="password" required /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit">Update password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <h1 className="text-4xl">Choose a new password</h1>
        <div className="mt-6"><Suspense><ResetForm /></Suspense></div>
      </div>
    </main>
  );
}
