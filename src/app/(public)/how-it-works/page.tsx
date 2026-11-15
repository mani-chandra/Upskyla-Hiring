import type { Metadata } from "next";
import { FullProcess, Process } from "@/components/marketing";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <main className="container py-16">
      <p className="eyebrow">How it works</p>
      <h1 className="mt-3 max-w-3xl text-5xl">Register, train, get assessed, apply, then interview with the company.</h1>
      <div className="mt-10"><Process /></div>
      <h2 className="mt-16 text-4xl">The operating process</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">These are the steps Upskyla follows. A shortlist, a mock interview or a referral is not employment. Only the hiring company’s decision, recorded as a hiring outcome, says whether someone was selected or joined.</p>
      <div className="mt-8"><FullProcess /></div>
    </main>
  );
}
