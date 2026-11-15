import type { Metadata } from "next";
import { JsonForm } from "@/components/json-form";

export const metadata: Metadata = { title: "For companies" };

export default function ForCompaniesPage() {
  return (
    <main className="container grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="eyebrow">For companies</p>
        <h1 className="mt-3 text-5xl">Partner with Upskyla.</h1>
        <p className="mt-4 text-sm leading-7 text-muted">Tell us about a role you are hiring for. An Upskyla administrator will create the company profile and publish the vacancy. Your team keeps the final interview and the hiring decision. There is no employer login to manage.</p>
        <ul className="mt-6 grid gap-3 text-sm leading-6 text-muted">
          <li>Share the job description, location, salary and deadline.</li>
          <li>Upskyla screens enrolled students against those requirements.</li>
          <li>Only consenting shortlisted candidates are forwarded.</li>
        </ul>
      </div>
      <div className="surface p-6">
        <h2 className="text-3xl">Ask Upskyla to collaborate</h2>
        <div className="mt-5">
          <JsonForm url="/api/companies/inquire" button="Partner With Upskyla">
            <label className="field">Company name<input name="name" required /></label>
            <label className="field">Industry<input name="industry" required /></label>
            <label className="field">Location<input name="location" required /></label>
            <label className="field">HR contact<input name="hrName" required /></label>
            <label className="field">HR email<input name="hrEmail" type="email" required /></label>
            <label className="field">HR phone<input name="hrPhone" required /></label>
            <label className="field">Website<input name="website" placeholder="https://" /></label>
            <label className="field">What are you hiring for?<textarea name="note" rows={4} required /></label>
          </JsonForm>
        </div>
      </div>
    </main>
  );
}
