import type { Metadata } from "next";
import { FullProcess, PageIntro, Process } from "@/components/marketing";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <main>
      <PageIntro
        eyebrow="How it works"
        title="Register, train, get assessed, apply, then interview with the company."
        lede="The path is the same for every student. What changes is the course, and therefore the vacancies that stay open. Nothing in the later stages turns a mock interview, a shortlist, or a referral into a job."
      />
      <div className="container py-16">
        <Process />
        <h2 className="mt-16 text-4xl">The operating process</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">These are the steps Upskyla follows, in order. A student can withdraw an application before it is forwarded. After forwarding, status changes are made by an administrator and written to a history the student can read. Only a hiring outcome of Joined means the person joined the company.</p>
        <div className="mt-8"><FullProcess /></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 border border-line">
            <h3 className="text-2xl">What you complete</h3>
            <p className="mt-2 text-sm leading-7 text-muted">Account confirmation, course payment, personal details, education, resume, skill and language ratings, and the scored assessments for your course.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 border border-line">
            <h3 className="text-2xl">What Upskyla checks</h3>
            <p className="mt-2 text-sm leading-7 text-muted">Course category against the role, the application deadline, profile completeness, and any degree, year, location, score, skill or language rule on that job.</p>
          </article>
          <article className="rounded-2xl bg-white p-5 border border-line">
            <h3 className="text-2xl">What the company does</h3>
            <p className="mt-2 text-sm leading-7 text-muted">Reads the forwarded profile, runs the final interview, and tells Upskyla the outcome. Administrators do not mark someone employed from an earlier status.</p>
          </article>
        </div>
      </div>
    </main>
  );
}
