"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { SignOutButton } from "@/components/site/chrome";
import { cn } from "@/lib/utils";

export function AppShell({
  title,
  name,
  items,
  children,
}: {
  title: string;
  name: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="grid gap-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/student" && item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn("rounded-xl px-3 py-2 text-sm", active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-navy text-white lg:flex lg:flex-col lg:px-4 lg:py-6">
        <p className="px-3 text-xs font-semibold tracking-[0.18em] text-white/50">{title}</p>
        <p className="mt-2 px-3 text-lg serif text-white">{name}</p>
        <div className="mt-6 flex-1">{nav}</div>
        <SignOutButton className="mx-3 mt-4 text-left text-sm text-white/70" />
      </aside>
      <div>
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <button aria-label="Open navigation" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-line"><Menu size={18} /></button>
          <p className="text-sm font-semibold">{title}</p>
          <SignOutButton className="text-sm text-muted" />
        </div>
        {open ? (
          <div className="fixed inset-0 z-40 bg-navy/40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="h-full w-72 bg-navy p-4 text-white" onClick={(event) => event.stopPropagation()}>
              <p className="px-3 serif text-2xl">{name}</p>
              <div className="mt-4">{nav}</div>
            </div>
          </div>
        ) : null}
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
