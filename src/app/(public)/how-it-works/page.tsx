import type { Metadata } from "next";
import { FullProcess, PageIntro, Process } from "@/components/marketing";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <main>
      <PageIntro
        eyebrow="How it works"
        title="Register, train, get assessed, apply, then interview with the company."
        lede="The path is the same for every student. What changes is the course, and therefore the vacancies that stay open. Nothing in the later stages turns a mock interview, a shortlist, or a referral into a job."
        imageSrc="/images/section-interview.jpg"
        imageAlt="Interview preparation meeting"
      />
      <div className="container py-16">
        <Reveal><Process /></Reveal>
        <Reveal>
          <h2 className="mt-16 text-4xl">The operating process</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">These are the steps Upskyla follows, in order. A student can withdraw an application before it is forwarded. Only a hiring outcome of Joined means the person joined the company.</p>
        </Reveal>
        <div className="mt-8"><FullProcess /></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["What you complete", "Account confirmation, course payment, personal details, education, resume, skill ratings, and scored assessments."],
            ["What Upskyla checks", "Course category, deadline, profile completeness, and any degree, year, location, score, skill or language rule on that job."],
            ["What the company does", "Reads the forwarded profile, runs the final interview, and tells Upskyla the outcome."],
          ].map(([title, text], index) => (
            <Reveal key={title} delay={index * 70}>
              <article className="rounded-[1.5rem] border border-line bg-white p-5 card-hover">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
