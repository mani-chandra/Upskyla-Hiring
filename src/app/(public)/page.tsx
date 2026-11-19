import Image from "next/image";
import Link from "next/link";
import { CourseGrid, ExpectationGrid, FaqList, ImageSplit, OfferGrid, Process, ProductPreview } from "@/components/marketing";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui";
import { brand } from "@/lib/brand";
import { listCourses } from "@/server/catalog";

export default async function HomePage() {
  const courses = await listCourses();
  return (
    <main>
      <section className="hero-bleed">
        <div className="hero-bleed__media">
          <Image
            src="/images/hero-graduate-desk.jpg"
            alt="Graduate preparing for career opportunities at a modern desk"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-bleed__shade" />
        <div className="container grid items-end gap-10 pb-14 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-28">
          <div className="rise">
            <p className="text-sm font-semibold tracking-[0.22em] text-white/80">{brand.wordmark}</p>
            <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-white/55">{brand.tagline}</p>
            <h1 className="mt-5 max-w-xl text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl">{brand.hero}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/78">{brand.heroSupport}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/courses">Explore Courses</Link></Button>
              <Button asChild variant="ghost"><Link href="/register">Register Now</Link></Button>
            </div>
          </div>
          <div className="rise rise-late hidden lg:block">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="section-band" id="about">
        <div className="container">
          <ImageSplit
            src="/images/section-skills.jpg"
            alt="Workspace with assessment materials and career preparation tools"
            eyebrow="About Upskyla"
            title="A training desk and a recruitment desk, kept on one student record."
            text="Graduates often leave college with a degree and a list of applications, and little evidence of what they can do in a first role. Upskyla sits between students and hiring teams: enroll, finish a profile, take assessments, then meet companies only after screening and consent."
          />
          <ExpectationGrid />
        </div>
      </section>

      <section className="container pb-20">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-2 max-w-2xl text-4xl">Five stages, from a confirmed account to a company interview.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Hover or tap a stage to see what happens next. A later stage does not rewrite an earlier one into a job offer.</p>
            </div>
            <Link href="/how-it-works" className="hidden text-sm font-semibold text-electric sm:inline">See the full process</Link>
          </div>
        </Reveal>
        <Reveal delay={80}><Process /></Reveal>
      </section>

      <section className="container pb-20" id="courses">
        <Reveal>
          <p className="eyebrow">Courses</p>
          <h2 className="mt-2 max-w-2xl text-4xl">Choose the hiring track you want to prepare for.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">IT opens technology roles. Non-IT opens business and operations roles. Combined opens both. Prices come from the live catalog.</p>
        </Reveal>
        <div className="mt-8"><CourseGrid courses={courses} /></div>
      </section>

      <section className="section-band bg-white/40">
        <div className="container">
          <ImageSplit
            reverse
            src="/images/section-interview.jpg"
            alt="Mock interview preparation in a professional meeting room"
            eyebrow="What we offer"
            title="Preparation, a scored record, and a path into published roles."
            text="The work is practical and visible on your account: training for the course you paid for, assessments with a history, a resume the application route can require, and interviews Upskyla schedules before any company sees you."
          />
          <div className="mt-10"><OfferGrid /></div>
        </div>
      </section>

      <section className="container py-20">
        <Reveal>
          <div className="surface grid gap-6 overflow-hidden p-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 lg:p-12">
              <p className="eyebrow">Hiring partners</p>
              <h2 className="mt-2 text-4xl">How collaboration with companies works.</h2>
              <p className="mt-4 text-sm leading-7 text-muted">A company shares the role. Upskyla publishes it, screens enrolled students, and forwards only consenting shortlisted candidates. The company runs the final interview and decides.</p>
              <p className="mt-3 text-sm leading-7 text-muted">This site does not display partner logos or claim relationships that have not been established. Sample vacancies are labeled as samples.</p>
              <ul className="mt-6 grid gap-3 text-sm leading-6 text-muted">
                <li className="border-l-2 border-electric/40 pl-3">Role, location, salary range and openings</li>
                <li className="border-l-2 border-electric/40 pl-3">Qualification, skills, languages and deadline</li>
                <li className="border-l-2 border-electric/40 pl-3">Final interview and a distinct hiring outcome</li>
              </ul>
            </div>
            <div className="relative min-h-[280px]">
              <Image src="/images/section-interview.jpg" alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 45vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 text-sm leading-6 text-white/90">No employer login in this version. An administrator keeps the company profile, interview notes and outcome.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container pb-20">
        <Reveal>
          <div className="cta-band rounded-[1.75rem] px-8 py-12 text-white lg:px-12">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/50">FOR COMPANIES</p>
            <h2 className="mt-3 max-w-2xl text-4xl text-white">Hire from graduates who have a course, a resume and a screening record.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Share the role and the rules you care about. Upskyla screens enrolled students and forwards only consenting shortlisted candidates.</p>
            <Button asChild className="mt-6"><Link href="/for-companies">Partner With Upskyla</Link></Button>
          </div>
        </Reveal>
      </section>

      <section className="container pb-20">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-2 text-4xl">Straight answers before you enroll.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Open a question to see what a course unlocks, when payment counts, and which statuses are not a job.</p>
        </Reveal>
        <div className="mt-8"><FaqList /></div>
      </section>
    </main>
  );
}
