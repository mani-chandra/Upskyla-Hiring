import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="container py-16">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 max-w-3xl text-5xl">Upskyla prepares graduates and then helps them meet companies that are hiring.</h1>
      <div className="mt-8 grid gap-6 text-base leading-7 text-muted lg:grid-cols-2">
        <p>Job seekers leave college with a degree and a stack of applications. Hiring teams receive those applications without a shared picture of skills, assessments or interview readiness. Upskyla is built to close that gap with a single record for each student: course, profile, resume, self-reported skills and separate verified results.</p>
        <p>The company does not employ students itself, and it does not promise a placement. It trains, assesses, publishes vacancies it is working on, screens applicants, and forwards consenting shortlisted candidates. The hiring company interviews and decides.</p>
        <p>Students choose an IT course, a Non-IT course, or both. That choice is stored with the enrollment and enforced when a job is opened or an application is submitted. Prices live in the course catalog, so a new batch offer can change without rewriting the site.</p>
        <p>Companies do not sign in. Upskyla administrators keep the company profile, the job description, interview notes and the hiring outcome. Internal notes stay inside the admin desk.</p>
      </div>
    </main>
  );
}
