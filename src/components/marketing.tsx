import Link from "next/link";
import { courseNotes, expectations, faqs, fullProcess, offerings, processStages } from "@/lib/content";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui";

export type CourseCard = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  label: string;
};

export function ProductPreview() {
  const cards = [
    { title: "Student profile", line: "Education, photo and resume", meta: "Required before you can apply", width: "80%" },
    { title: "Assessments", line: "Verified skills, kept separate", meta: "Self-report is not a score", width: "64%" },
    { title: "Open vacancy", line: "Location, deadline, rules", meta: "Company decides the hire", width: "46%" },
  ];
  return (
    <div className="surface relative overflow-hidden p-4 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-electric/15 blur-2xl" />
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted">STUDENT · TRAINING · HIRING</p>
          <span className="rounded-full bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">Screening pipeline</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-line bg-mist p-3">
              <p className="text-sm font-semibold">{card.title}</p>
              <p className="mt-2 text-sm text-navy">{card.line}</p>
              <div className="meter mt-3"><span style={{ ["--w" as string]: card.width }} /></div>
              <p className="mt-2 text-xs text-muted">{card.meta}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-navy px-4 py-3 text-sm leading-6 text-white/80">
          A shortlist is not a job offer. Upskyla forwards a profile only after you consent and after the mock interview screening.
        </div>
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="page-hero text-white">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <div className="container rise py-16 lg:py-20">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[1.08] text-white sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">{lede}</p>
      </div>
    </section>
  );
}

export function CourseGrid({ courses }: { courses: CourseCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course, index) => (
        <article key={course.slug} className="surface card-hover flex flex-col p-6" style={{ animationDelay: `${index * 80}ms` }}>
          <p className="eyebrow">{course.label}</p>
          <h3 className="mt-3 text-3xl">{course.name}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{course.summary}</p>
          <p className="mt-3 flex-1 text-sm leading-6 text-ink/80">{course.description}</p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
            {(courseNotes[course.slug] ?? []).map((note) => (
              <li key={note} className="border-l-2 border-electric/40 pl-3">{note}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted line-through">{inr(course.originalPrice)} original</p>
          <p className="text-3xl text-navy">{inr(course.offerPrice)}</p>
          <p className="mt-1 text-xs text-muted">Current batch offer, read from the course catalog.</p>
          <Button asChild className="mt-5"><Link href="/register">Register for this course</Link></Button>
        </article>
      ))}
    </div>
  );
}

export function Process() {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {processStages.map((stage) => (
        <article key={stage.step} className="surface card-hover relative p-5">
          <p className="text-sm font-semibold tracking-[0.14em] text-electric">{stage.step}</p>
          <h3 className="mt-3 text-2xl">{stage.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{stage.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ExpectationGrid() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {expectations.map((item) => (
        <article key={item.title} className="rounded-2xl border border-line bg-white p-5 card-hover">
          <h3 className="text-2xl">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function OfferGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {offerings.map((item) => (
        <article key={item.title} className="rounded-2xl border border-line bg-white p-5 card-hover">
          <h3 className="text-2xl">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function FaqList() {
  return (
    <div className="grid gap-3">
      {faqs.map((item) => (
        <details key={item.q} className="surface card-hover group p-5 open:border-electric/30">
          <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
            <span className="flex items-start justify-between gap-4">
              {item.q}
              <span className="mt-1 text-electric transition group-open:rotate-45" aria-hidden>+</span>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FullProcess() {
  return (
    <ol className="grid gap-3">
      {fullProcess.map((step, index) => (
        <li key={step} className="surface card-hover flex gap-4 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm text-white">{index + 1}</span>
          <p className="text-sm leading-7">{step}</p>
        </li>
      ))}
    </ol>
  );
}
