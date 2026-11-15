import Link from "next/link";
import { CourseGrid, FaqList, OfferGrid, Process, ProductPreview } from "@/components/marketing";
import { Button } from "@/components/ui";
import { brand } from "@/lib/brand";
import { listCourses } from "@/server/catalog";

export default async function HomePage() {
  const courses = await listCourses();
  return (
    <main>
      <section className="hero-grid text-white">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60">{brand.tagline}</p>
            <h1 className="mt-4 max-w-xl text-5xl leading-[1.05] sm:text-6xl">{brand.hero}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">{brand.heroSupport}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/courses">Explore Courses</Link></Button>
              <Button asChild variant="ghost"><Link href="/register">Register Now</Link></Button>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="container py-20" id="about">
        <p className="eyebrow">About Upskyla</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <h2 className="text-4xl leading-tight sm:text-5xl">A training desk and a recruitment desk, on one platform.</h2>
          <p className="text-base leading-7 text-muted">Graduates often finish college without a clear path into a hiring process. Companies, meanwhile, spend time on applicants who have not been prepared or screened. Upskyla sits between those two sides: students enroll, build a profile, and take assessments. Upskyla publishes vacancies and runs the first screening. Companies interview the people who are forwarded and make the hiring decision themselves.</p>
        </div>
      </section>

      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-4xl">Five stages, from registration to a company interview.</h2>
          </div>
          <Link href="/how-it-works" className="hidden text-sm font-semibold text-electric sm:inline">See the full process</Link>
        </div>
        <Process />
      </section>

      <section className="container pb-20" id="courses">
        <p className="eyebrow">Courses</p>
        <h2 className="mt-2 max-w-2xl text-4xl">Choose the hiring track you want to prepare for.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Fees come from the current course price, not from a fixed label on the page. The struck-through amount is the original price. The larger amount is the new batch offer.</p>
        <div className="mt-8"><CourseGrid courses={courses} /></div>
      </section>

      <section className="container pb-20">
        <p className="eyebrow">What we offer</p>
        <h2 className="mt-2 text-4xl">Preparation, screening and access to roles.</h2>
        <div className="mt-8"><OfferGrid /></div>
      </section>

      <section className="container pb-20">
        <div className="surface grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="eyebrow">Hiring partners</p>
            <h2 className="mt-2 text-4xl">How collaboration with companies works.</h2>
            <p className="mt-4 text-sm leading-7 text-muted">Upskyla works with companies that have open vacancies. A company shares the role. Upskyla publishes the job description, checks which enrolled students are eligible, and screens applicants with a mock interview. Shortlisted profiles are forwarded only after the student consents. The company runs the final interview and decides whether to hire.</p>
            <p className="mt-3 text-sm leading-7 text-muted">This site does not display partner logos or claim relationships that have not been established. Sample vacancies inside the product are labeled as samples so the workflow can be reviewed.</p>
          </div>
          <div className="rounded-2xl bg-mist p-6">
            <p className="text-sm font-semibold">What a company provides</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <li>The role, location, salary range and number of openings.</li>
              <li>The qualification, skills and deadline Upskyla should enforce.</li>
              <li>The final interview and the hiring decision.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="overflow-hidden rounded-[1.75rem] bg-navy px-8 py-12 text-white lg:px-12">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50">FOR COMPANIES</p>
          <h2 className="mt-3 max-w-2xl text-4xl text-white">Hire from graduates who have already been prepared and screened.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">HR teams can ask Upskyla to collaborate on a vacancy. There is no employer login in this version. Upskyla administrators manage company profiles, job descriptions and candidate referrals.</p>
          <Button asChild className="mt-6"><Link href="/for-companies">Partner With Upskyla</Link></Button>
        </div>
      </section>

      <section className="container pb-20">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-2 text-4xl">Straight answers before you enroll.</h2>
        <div className="mt-8"><FaqList /></div>
      </section>
    </main>
  );
}
