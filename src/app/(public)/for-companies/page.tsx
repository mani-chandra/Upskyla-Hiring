import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing";
import { JsonForm } from "@/components/json-form";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "For companies" };

export default function ForCompaniesPage() {
  return (
    <main>
      <PageIntro
        eyebrow="For companies"
        title="Partner with Upskyla."
        lede="Tell us about a role you are hiring for. An administrator creates the company profile, publishes the vacancy, and screens enrolled students against the rules you set. Your team keeps the final interview and the hiring decision."
        imageSrc="/images/section-interview.jpg"
        imageAlt="Hiring conversation in a professional room"
      />
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div>
            <h2 className="text-3xl">What you send, and what you still decide.</h2>
            <p className="mt-4 text-sm leading-7 text-muted">A useful brief names the work, the location, the salary range, how many people you need, and the deadline. Add degree, graduation year, skills, languages or a minimum assessment score if those should block an application.</p>
            <ul className="mt-6 grid gap-3 text-sm leading-6 text-muted">
              <li className="rounded-2xl border border-line bg-white px-4 py-3">Share the job description, location, salary, openings and deadline.</li>
              <li className="rounded-2xl border border-line bg-white px-4 py-3">Upskyla screens enrolled students and runs a mock interview.</li>
              <li className="rounded-2xl border border-line bg-white px-4 py-3">Only consenting shortlisted candidates are forwarded.</li>
              <li className="rounded-2xl border border-line bg-white px-4 py-3">You report Selected, Rejected, Joined, or Declined as separate outcomes.</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={90}>
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
        </Reveal>
      </div>
    </main>
  );
}
