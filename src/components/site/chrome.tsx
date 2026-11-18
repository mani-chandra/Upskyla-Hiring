"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { brand, phoneHref } from "@/lib/brand";
import { Button } from "@/components/ui";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/how-it-works", "How It Works"],
  ["/courses", "Courses"],
  ["/careers", "Career Opportunities"],
  ["/for-companies", "For Companies"],
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric text-sm font-semibold text-white">U</span>
      <span className={light ? "text-white" : "text-navy"}>
        <span className="block text-sm font-semibold tracking-[0.18em]">{brand.wordmark}</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo light />
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="nav-link">{label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <>
              <Button asChild size="sm"><Link href="/student">Dashboard</Link></Button>
              <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Login</Link></Button>
              <Button asChild size="sm"><Link href="/register">Register Now</Link></Button>
            </>
          )}
        </div>
        <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-4 py-4 lg:hidden">
          <div className="grid gap-3">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            <Link href={signedIn ? "/student" : "/login"} onClick={() => setOpen(false)}>{signedIn ? "Dashboard" : "Login"}</Link>
            {!signedIn ? <Link href="/register" onClick={() => setOpen(false)}>Register Now</Link> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">{brand.tagline} Upskyla trains graduates on an IT, Non-IT, or combined track, scores their skills separately from what they report, and introduces eligible, consenting candidates to companies that have shared a vacancy. Employment is not guaranteed.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-white/50">NAVIGATION</p>
          <div className="mt-3 grid gap-2 text-sm text-white/80">
            {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-white/50">CONTACT</p>
          <div className="mt-3 grid gap-2 text-sm text-white/80">
            {brand.phones.map((phone) => <a key={phone} href={phoneHref(phone)}>{phone}</a>)}
            <a href={brand.websiteUrl}>{brand.websiteLabel}</a>
            <p className="text-white/60">Social profiles are published from {brand.websiteLabel}. This site does not link to accounts that have not been established.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
  );
}
