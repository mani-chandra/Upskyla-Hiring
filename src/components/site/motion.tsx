"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "reveal-in", className)}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

export function ProcessRail() {
  const [active, setActive] = useState(0);
  const stages = [
    { step: "01", title: "Register", text: "Confirm email and phone so Upskyla can reach you about training and roles." },
    { step: "02", title: "Train", text: "Pay for IT, Non-IT, or Combined. That course decides which vacancies you can open." },
    { step: "03", title: "Assess", text: "Finish profile details, then sit scored tests kept separate from self-reported skills." },
    { step: "04", title: "Apply", text: "Apply only where your course, scores and deadline match. Consent is required to share." },
    { step: "05", title: "Interview", text: "Upskyla runs a mock round. The company holds the final interview and decides." },
  ];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % 5);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-2">
        {stages.map((stage, index) => (
          <button
            key={stage.step}
            type="button"
            onClick={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition",
              active === index
                ? "border-electric bg-white shadow-[0_18px_40px_rgba(11,31,58,0.08)]"
                : "border-transparent bg-white/50 hover:border-line hover:bg-white",
            )}
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-electric">{stage.step}</p>
            <p className="mt-1 text-xl font-semibold text-navy">{stage.title}</p>
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-navy px-7 py-8 text-white min-h-[280px]">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-electric/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-teal/25 blur-2xl" />
        <p className="text-xs font-semibold tracking-[0.18em] text-white/50">STAGE {stages[active].step}</p>
        <h3 className="mt-4 text-4xl text-white">{stages[active].title}</h3>
        <p className="mt-4 max-w-md text-base leading-7 text-white/75">{stages[active].text}</p>
        <div className="mt-8 flex gap-2">
          {stages.map((stage, index) => (
            <span
              key={stage.step}
              className={cn("h-1.5 flex-1 rounded-full transition", active === index ? "bg-electric" : "bg-white/20")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
