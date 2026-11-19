import type { Metadata } from "next";
import { ExpectationGrid, ImageSplit, PageIntro } from "@/components/marketing";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About"
        title="Upskyla prepares graduates, then introduces the ones who match a real vacancy."
        lede="The platform keeps training and recruitment on one record: the course you paid for, the profile you completed, the skills you reported, and the scores from separate assessments. Companies meet candidates only after that record exists and the student has agreed to share it."
        imageSrc="/images/section-skills.jpg"
        imageAlt="Career preparation workspace"
      />
      <div className="container py-16">
        <ImageSplit
          src="/images/hero-graduate-desk.jpg"
          alt="Graduate working through career preparation"
          eyebrow="Why Upskyla exists"
          title="One student record instead of a blank application pile."
          text="Job seekers leave college with a degree and a stack of applications. Hiring teams receive those applications without a shared picture of skills, assessments or interview readiness. Upskyla closes that gap with personal details, education, a private resume, languages, and the difference between a self-rated skill and a verified one."
        />
        <div className="mt-12 grid gap-6 text-base leading-7 text-muted lg:grid-cols-2">
          <Reveal>
            <p>Upskyla does not employ students, and it does not promise a placement. It trains, assesses, publishes vacancies it is working on, screens applicants, and forwards consenting shortlisted candidates. The hiring company interviews and decides. Selected and Joined stay separate.</p>
          </Reveal>
          <Reveal delay={80}>
            <p>Students choose an IT course, a Non-IT course, or both. That choice is stored with the enrollment and enforced when a job is opened or an application is submitted. Prices live in the course catalog, so a new batch offer can change without rewriting the site.</p>
          </Reveal>
        </div>
        <ExpectationGrid />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal>
            <article className="surface card-hover p-6">
              <h2 className="text-3xl">Who the student side is for</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Graduates and final-year students who want a defined preparation track and a place to apply for roles Upskyla is already screening.</p>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="surface card-hover p-6">
              <h2 className="text-3xl">Who the company side is for</h2>
              <p className="mt-3 text-sm leading-7 text-muted">HR teams with an open vacancy who want Upskyla to publish the role, enforce requirements, and send only shortlisted candidates who have consented.</p>
            </article>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
