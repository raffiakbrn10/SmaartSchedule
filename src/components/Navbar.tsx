"use client";

import { ThemeToggle } from "./ThemeToggle";
export function Navbar({ onMenuClick }: { onMenuClick(): void }) {
  return <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-black/70"><div className="flex h-16 items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={onMenuClick} aria-label="Buka menu" className="rounded-lg p-2 text-xl hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:bg-neutral-800 lg:hidden">☰</button><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/30 dark:bg-cyan-500">S</span><span className="hidden text-xl font-bold tracking-tight sm:block">SmartSchedule</span></div></div><ThemeToggle /></div></header>;
}


