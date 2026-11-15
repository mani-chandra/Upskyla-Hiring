import Link from "next/link";
import { faqs, fullProcess, offerings, processStages } from "@/lib/content";
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
  return (
    <div className="surface relative overflow-hidden p-4 text-ink sm:p-5">
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted">STUDENT · TRAINING · HIRING</p>
          <span className="rounded-full bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">Live pipeline</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Asha N.", "Profile 80%", "IT preparation"],
            ["Assessment", "Verified SQL", "Separate from self-report"],
            ["Junior analyst", "Hyderabad", "Company decides"],
          ].map(([title, line, meta]) => (
            <div key={title} className="rounded-2xl border border-line bg-mist p-3">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-sm text-navy">{line}</p>
              <p className="mt-1 text-xs text-muted">{meta}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-navy px-4 py-3 text-sm text-white/80">
          Shortlist is not a job offer. Forwarding happens only after consent and Upskyla’s screening.
        </div>
      </div>
    </div>
  );
}

export function CourseGrid({ courses }: { courses: CourseCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course) => (
        <article key={course.slug} className="surface flex flex-col p-6">
          <p className="eyebrow">{course.label}</p>
          <h3 className="mt-3 text-3xl">{course.name}</h3>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted">{course.summary}</p>
          <p className="mt-6 text-sm text-muted line-through">{inr(course.originalPrice)}</p>
          <p className="text-3xl text-navy">{inr(course.offerPrice)}</p>
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
        <article key={stage.step} className="surface p-5">
          <p className="text-sm font-semibold text-electric">{stage.step}</p>
          <h3 className="mt-3 text-2xl">{stage.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{stage.text}</p>
        </article>
      ))}
    </div>
  );
}

export function OfferGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {offerings.map((item) => (
        <article key={item.title} className="rounded-2xl border border-line bg-white p-5">
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
        <details key={item.q} className="surface p-5">
          <summary className="cursor-pointer text-lg font-semibold">{item.q}</summary>
          <p className="mt-3 text-sm leading-6 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FullProcess() {
  return (
    <ol className="grid gap-3">
      {fullProcess.map((step, index) => (
        <li key={step} className="surface flex gap-4 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm text-white">{index + 1}</span>
          <p className="text-sm leading-6">{step}</p>
        </li>
      ))}
    </ol>
  );
}
