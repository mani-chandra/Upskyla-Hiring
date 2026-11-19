"use client";

import { useEffect, useRef, useState } from "react";

export function AtmosphereEffects() {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0, active: false });
  const scrollTone = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-effects-on");

    const onMove = (event: PointerEvent) => {
      pointer.current.tx = event.clientX;
      pointer.current.ty = event.clientY;
      pointer.current.active = true;
      const target = event.target as HTMLElement | null;
      const interactive = Boolean(target?.closest("a, button, summary, input, textarea, select, [role='button']"));
      document.documentElement.classList.toggle("cursor-interactive", interactive);
    };
    const onLeave = () => {
      pointer.current.active = false;
      document.documentElement.classList.remove("cursor-interactive");
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTone.current = Math.min(1, Math.max(0, window.scrollY / max));
      const pct = `${(scrollTone.current * 100).toFixed(1)}%`;
      document.documentElement.style.setProperty("--scroll-tone", pct);
      document.documentElement.style.setProperty("--scroll-y", `${Math.round(window.scrollY)}px`);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let frame = 0;
    const tick = () => {
      const state = pointer.current;
      state.x += (state.tx - state.x) * 0.18;
      state.y += (state.ty - state.y) * 0.18;

      if (spotRef.current) {
        spotRef.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
        spotRef.current.style.opacity = state.active ? "1" : "0";
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${state.tx}px, ${state.ty}px, 0)`;
        cursorRef.current.style.opacity = state.active ? "1" : "0";
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
        ringRef.current.style.opacity = state.active ? "1" : "0";
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("cursor-interactive", "cursor-effects-on");
      document.documentElement.style.removeProperty("--scroll-tone");
      document.documentElement.style.removeProperty("--scroll-y");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="atmosphere" aria-hidden>
      <div className="atmosphere-scroll" />
      <div ref={spotRef} className="atmosphere-spot" />
      <div ref={ringRef} className="atmosphere-ring" />
      <div ref={cursorRef} className="atmosphere-dot" />
    </div>
  );
}
