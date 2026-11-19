import Image from "next/image";
import Link from "next/link";
import { courseNotes, expectations, faqs, fullProcess, offerings } from "@/lib/content";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui";
import { ProcessRail, Reveal } from "@/components/site/motion";

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
    <div className="preview-stage float-y">
      <div className="surface relative overflow-hidden p-4 text-ink sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-electric/15 blur-2xl" />
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-xs font-semibold text-white">U</span>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted">UPSKYLA DESK</p>
            </div>
            <span className="text-xs font-semibold text-teal">Live pipeline</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-line bg-mist/90 p-3 transition hover:-translate-y-1 hover:border-electric/30">
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
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  lede,
  imageSrc,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  lede: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <section className="page-hero text-white">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <div className={`container rise grid items-end gap-10 py-16 lg:py-20 ${imageSrc ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <div>
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.08] text-white sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">{lede}</p>
        </div>
        {imageSrc ? (
          <div className="media-frame hidden lg:block">
            <Image src={imageSrc} alt={imageAlt} width={960} height={640} className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CourseGrid({ courses }: { courses: CourseCard[] }) {
  const accents: Record<string, string> = {
    it: "from-[#123056] to-[#2f6bff]",
    "non-it": "from-[#0b1f3a] to-[#0f766e]",
    combined: "from-[#1d4fd0] to-[#0b1f3a]",
  };
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {courses.map((course, index) => (
        <Reveal key={course.slug} delay={index * 90}>
          <article className="surface card-hover flex h-full flex-col overflow-hidden p-0">
            <div className={`h-28 bg-gradient-to-br ${accents[course.slug] ?? accents.it} px-6 py-5 text-white`}>
              <p className="text-xs font-semibold tracking-[0.16em] text-white/70">{course.label}</p>
              <h3 className="mt-2 text-3xl text-white">{course.name}</h3>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm leading-6 text-muted">{course.summary}</p>
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
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function Process() {
  return <ProcessRail />;
}

export function ExpectationGrid() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {expectations.map((item, index) => (
        <Reveal key={item.title} delay={index * 80}>
          <article className="relative overflow-hidden rounded-[1.5rem] border border-line bg-white p-6 card-hover">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-electric/10" />
            <p className="text-xs font-semibold tracking-[0.16em] text-electric">0{index + 1}</p>
            <h3 className="mt-3 text-2xl">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function OfferGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {offerings.map((item, index) => (
        <Reveal key={item.title} delay={(index % 3) * 70}>
          <article className="group rounded-[1.5rem] border border-line bg-white/90 p-5 card-hover">
            <div className="mb-4 h-1.5 w-10 rounded-full bg-electric transition group-hover:w-16" />
            <h3 className="text-2xl">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
          </article>
        </Reveal>
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
              <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-mist text-electric transition group-open:rotate-45 group-open:bg-electric group-open:text-white" aria-hidden>+</span>
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
        <Reveal key={step} delay={Math.min(index * 40, 280)}>
          <li className="surface card-hover flex gap-4 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm text-white">{index + 1}</span>
            <p className="text-sm leading-7">{step}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function ImageSplit({
  src,
  alt,
  eyebrow,
  title,
  text,
  reverse = false,
  children,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  text: string;
  reverse?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <Reveal>
        <div className="media-frame">
          <Image src={src} alt={alt} width={1200} height={800} className="h-full min-h-[300px] w-full object-cover" />
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-4xl leading-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{text}</p>
          {children}
        </div>
      </Reveal>
    </div>
  );
}
