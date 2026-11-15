"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PayButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setError("");
    const response = await fetch("/api/payments/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = (await response.json()) as {
      error?: string;
      mode?: string;
      paymentId?: string;
      orderId?: string;
      amountPaise?: number;
      currency?: string;
      keyId?: string;
      courseName?: string;
    };
    if (!response.ok || !data.paymentId) {
      setPending(false);
      setError(data.error ?? "Could not start payment.");
      return;
    }
    if (data.mode === "demo") {
      setNote("Demonstration checkout. Razorpay is not configured, so no money is collected. Enrollment still waits for this server to confirm the demo payment.");
      const done = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentId: data.paymentId }),
      });
      const result = (await done.json()) as { error?: string };
      setPending(false);
      if (!done.ok) {
        setError(result.error ?? "Could not confirm the demonstration payment.");
        return;
      }
      router.push("/student/profile");
      router.refresh();
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay failed to load"));
      document.body.appendChild(script);
    }).catch(() => setError("Razorpay could not be loaded."));
    if (!window.Razorpay) {
      setPending(false);
      return;
    }
    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.amountPaise,
      currency: data.currency,
      order_id: data.orderId,
      name: "Upskyla",
      description: data.courseName,
      handler: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verified = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            orderId: payload.razorpay_order_id,
            paymentId: payload.razorpay_payment_id,
            signature: payload.razorpay_signature,
          }),
        });
        setPending(false);
        if (!verified.ok) {
          setError("The payment signature could not be verified.");
          return;
        }
        router.push("/student/profile");
        router.refresh();
      },
    });
    checkout.open();
    setPending(false);
  }

  return (
    <div className="grid gap-3">
      {note ? <p className="rounded-xl bg-amber/10 p-3 text-sm text-amber">{note}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="button" onClick={pay} disabled={pending}>{pending ? "Contacting the payment desk…" : "Pay and activate enrollment"}</Button>
    </div>
  );
}

export function UploadForm({ url, accept, label, field }: { url: string; accept: string; label: string; field: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(url, { method: "POST", body: new FormData(event.currentTarget) });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="field">{label}<input type="file" name={field} accept={accept} required /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Upload"}</Button>
    </form>
  );
}

export function AssessmentForm({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: { id: string; prompt: string; type: string; options: { id: string; text: string }[] }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const answers = questions.map((question) => ({
      questionId: question.id,
      optionIds: form.getAll(question.id).map(String),
      text: String(form.get(`${question.id}-text`) ?? ""),
    }));
    const response = await fetch(`/api/student/assessments/${assessmentId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Could not submit.");
      return;
    }
    router.push("/student/assessments");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {questions.map((question, index) => (
        <fieldset key={question.id} className="surface p-5">
          <legend className="text-base font-semibold">{index + 1}. {question.prompt}</legend>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">{question.type.replaceAll("_", " ")}</p>
          {question.type === "CODING" ? (
            <textarea className="mt-3" name={`${question.id}-text`} rows={6} placeholder="Write your answer. It is stored for review and is not executed." required />
          ) : (
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-start gap-2 text-sm font-normal">
                  <input className="mt-1 w-auto" type={question.type === "MULTI_SELECT" ? "checkbox" : "radio"} name={question.id} value={option.id} />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ))}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit assessment"}</Button>
    </form>
  );
}

export function ApplyButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setError("");
    const response = await fetch("/api/student/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId, consent }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not apply.");
      return;
    }
    router.push("/student/applications");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <label className="flex items-start gap-2 text-sm font-normal">
        <input className="mt-1 w-auto" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I consent to Upskyla sharing my profile, education, resume and assessment results with the hiring company if I am shortlisted.</span>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="button" onClick={apply} disabled={!consent}>Apply</Button>
    </div>
  );
}
