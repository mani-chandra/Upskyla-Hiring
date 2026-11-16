import type { Metadata } from "next";
import { ExpectationGrid, PageIntro } from "@/components/marketing";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About"
        title="Upskyla prepares graduates, then introduces the ones who match a real vacancy."
        lede="The platform keeps training and recruitment on one record: the course you paid for, the profile you completed, the skills you reported, and the scores from separate assessments. Companies meet candidates only after that record exists and the student has agreed to share it."
      />
      <div className="container py-16">
        <div className="grid gap-6 text-base leading-7 text-muted lg:grid-cols-2">
          <p>Job seekers leave college with a degree and a stack of applications. Hiring teams receive those applications without a shared picture of skills, assessments or interview readiness. Upskyla is built to close that gap. Each student has a single file an administrator can open: personal details, education, a private resume, languages, and the difference between a self-rated skill and a verified one.</p>
          <p>Upskyla does not employ students, and it does not promise a placement. It trains, assesses, publishes vacancies it is working on, screens applicants, and forwards consenting shortlisted candidates. The hiring company interviews and decides. Selected and Joined stay separate, so a selection is never described as someone having joined.</p>
          <p>Students choose an IT course, a Non-IT course, or both. That choice is stored with the enrollment and enforced when a job is opened or an application is submitted. An IT student cannot apply to a Non-IT role by browsing past the filter. Prices live in the course catalog, so a new batch offer can change without rewriting the site.</p>
          <p>Companies do not sign in. Upskyla administrators keep the company profile, the job description, interview notes and the hiring outcome. Internal notes stay inside the admin desk and are not shown on the student application.</p>
        </div>
        <ExpectationGrid />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="surface p-6">
            <h2 className="text-3xl">Who the student side is for</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Graduates and final-year students who want a defined preparation track and a place to apply for roles Upskyla is already screening. You need an email and phone you can confirm, a course payment, and the time to finish the profile and the scored tests before a deadline.</p>
          </article>
          <article className="surface p-6">
            <h2 className="text-3xl">Who the company side is for</h2>
            <p className="mt-3 text-sm leading-7 text-muted">HR teams with an open vacancy who want Upskyla to publish the role, enforce the requirements they set, and send only shortlisted candidates who have consented. The company still runs the last interview and records whether someone was selected, rejected, joined, or declined.</p>
          </article>
        </div>
      </div>
    </main>
  );
}
