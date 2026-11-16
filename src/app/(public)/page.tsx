import Link from "next/link";
import { CourseGrid, ExpectationGrid, FaqList, OfferGrid, Process, ProductPreview } from "@/components/marketing";
import { Button } from "@/components/ui";
import { brand } from "@/lib/brand";
import { listCourses } from "@/server/catalog";

export default async function HomePage() {
  const courses = await listCourses();
  return (
    <main>
      <section className="hero-grid text-white">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="rise">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60">{brand.tagline}</p>
            <h1 className="mt-4 max-w-xl text-5xl leading-[1.05] sm:text-6xl">{brand.hero}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">{brand.heroSupport}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/courses">Explore Courses</Link></Button>
              <Button asChild variant="ghost"><Link href="/register">Register Now</Link></Button>
              <Button asChild variant="ghost"><Link href="/careers">Read open roles</Link></Button>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55">
              Fees on this site are the live course prices. Sample vacancies are labeled sample. Upskyla does not publish partner logos or placement counts.
            </p>
          </div>
          <div className="rise rise-late">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="container py-20" id="about">
        <p className="eyebrow">About Upskyla</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <h2 className="text-4xl leading-tight sm:text-5xl">A training desk and a recruitment desk, kept on one student record.</h2>
          <div className="grid gap-4 text-base leading-7 text-muted">
            <p>Graduates often leave college with a degree and a list of applications, and little evidence of what they can do in a first role. Companies then spend time on profiles that have not been prepared or screened against the actual vacancy.</p>
            <p>Upskyla sits between those two sides. Students enroll, finish a profile, and take assessments. Administrators publish vacancies, check eligibility, and run a mock interview. Companies interview the people who are forwarded and make the hiring decision themselves.</p>
          </div>
        </div>
        <ExpectationGrid />
      </section>

      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 max-w-2xl text-4xl">Five stages, from a confirmed account to a company interview.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Each stage is recorded. You can see your course, scores, applications and upcoming interviews in the student portal. A later stage does not rewrite an earlier one into a job offer.</p>
          </div>
          <Link href="/how-it-works" className="hidden text-sm font-semibold text-electric sm:inline">See the full process</Link>
        </div>
        <Process />
      </section>

      <section className="container pb-20" id="courses">
        <p className="eyebrow">Courses</p>
        <h2 className="mt-2 max-w-2xl text-4xl">Choose the hiring track you want to prepare for.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">IT preparation opens technology roles. Non-IT preparation opens business, operations and customer-facing roles. The combined course opens both. The struck-through amount is the original price. The larger amount is the current batch offer, loaded from the catalog.</p>
        <div className="mt-8"><CourseGrid courses={courses} /></div>
      </section>

      <section className="container pb-20">
        <p className="eyebrow">What we offer</p>
        <h2 className="mt-2 max-w-2xl text-4xl">Preparation, a scored record, and a path into published roles.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">The work is practical and visible on your account: training for the course you paid for, assessments with a history, a resume the application route can require, and interviews Upskyla schedules before any company sees you.</p>
        <div className="mt-8"><OfferGrid /></div>
      </section>

      <section className="container pb-20">
        <div className="surface grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="eyebrow">Hiring partners</p>
            <h2 className="mt-2 text-4xl">How collaboration with companies works.</h2>
            <p className="mt-4 text-sm leading-7 text-muted">Upskyla works with companies that have open vacancies. A company shares the role: what the person will do, where they will work, the salary range, how many openings, and the qualifications the screen should enforce.</p>
            <p className="mt-3 text-sm leading-7 text-muted">Administrators publish that job description, see which enrolled students already match, and run the first screening. Shortlisted profiles are forwarded only after the student consents. The company runs the final interview and decides whether to hire, reject, or wait.</p>
            <p className="mt-3 text-sm leading-7 text-muted">This site does not display partner logos or claim relationships that have not been established. Sample vacancies inside the product are labeled as samples so the workflow can be reviewed.</p>
          </div>
          <div className="rounded-2xl bg-mist p-6">
            <p className="text-sm font-semibold">What a company provides</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <li>The role, location, salary range, employment type and number of openings.</li>
              <li>The qualification, skills, languages, score floor and deadline Upskyla should enforce.</li>
              <li>The final interview, and a hiring outcome that stays distinct from a shortlist.</li>
            </ul>
            <p className="mt-5 text-sm leading-6 text-muted">There is no employer login in this version. An administrator keeps the company profile, interview notes and outcome.</p>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="cta-band rounded-[1.75rem] px-8 py-12 text-white lg:px-12">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50">FOR COMPANIES</p>
          <h2 className="mt-3 max-w-2xl text-4xl text-white">Hire from graduates who have a course, a resume and a screening record.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">HR teams can ask Upskyla to collaborate on a vacancy. Share the role and the rules you care about. Upskyla administrators publish the job, screen enrolled students, and forward only consenting shortlisted candidates. Your team still decides who joins.</p>
          <Button asChild className="mt-6"><Link href="/for-companies">Partner With Upskyla</Link></Button>
        </div>
      </section>

      <section className="container pb-20">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-2 text-4xl">Straight answers before you enroll.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">These cover the limits of the service: what a course unlocks, when payment counts, and which statuses are not a job.</p>
        <div className="mt-8"><FaqList /></div>
      </section>
    </main>
  );
}
