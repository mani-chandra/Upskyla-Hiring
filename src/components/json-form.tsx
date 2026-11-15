"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function JsonForm({
  url,
  children,
  button,
  redirect,
  method = "POST",
}: {
  url: string;
  children: React.ReactNode;
  button: string;
  redirect?: string;
  method?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setDone("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") continue;
      if (body[key] === undefined) body[key] = value;
      else if (Array.isArray(body[key])) (body[key] as string[]).push(value);
      else body[key] = [body[key], value];
    }
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; redirect?: string; message?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save that.");
      return;
    }
    if (redirect || data.redirect) {
      router.push(redirect || data.redirect || "/");
      router.refresh();
      return;
    }
    setDone(data.message ?? "Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {children}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {done ? <p className="text-sm text-teal">{done}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : button}</Button>
    </form>
  );
}
