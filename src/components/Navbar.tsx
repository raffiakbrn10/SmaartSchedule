"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logoLight from "@/images/Logo-Light.png";
import logoDark from "@/images/Logo-Dark.png";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({ onMenuClick }: { onMenuClick(): void }) {
  const pathname = usePathname();
  
  return (
    <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-2xl bg-white/60 dark:bg-[#0a0000]/60 border-b border-white/20 dark:border-white/5">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 relative">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} aria-label="Buka menu" className="rounded-xl p-2 text-neutral-600 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 lg:hidden transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <div className="flex items-center gap-2.5">
            <Image src={logoLight} alt="SmartSchedule Logo" className="h-10 w-auto object-contain dark:hidden" />
            <Image src={logoDark} alt="SmartSchedule Logo" className="h-10 w-auto object-contain hidden dark:block" />
            <span className="hidden text-xl font-extrabold tracking-tight sm:block">SmartSchedule</span>
          </div>
        </div>

        {/* Desktop Navigation Links (Center) */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/dashboard" className={`relative text-sm font-semibold transition-all duration-300 hover:text-red-600 dark:hover:text-red-400 group ${pathname === "/dashboard" ? "text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            Dashboard
            <span className={`absolute -bottom-5 left-0 h-[2px] w-full rounded-t-full transition-all duration-300 ${pathname === "/dashboard" ? "bg-red-600 dark:bg-red-500 shadow-[0_-2px_8px_rgba(220,38,38,0.5)]" : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-red-300 dark:group-hover:bg-red-800"}`} />
          </Link>
          <Link href="/schedule" className={`relative text-sm font-semibold transition-all duration-300 hover:text-red-600 dark:hover:text-red-400 group ${pathname === "/schedule" ? "text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            Jadwal Tugas
            <span className={`absolute -bottom-5 left-0 h-[2px] w-full rounded-t-full transition-all duration-300 ${pathname === "/schedule" ? "bg-red-600 dark:bg-red-500 shadow-[0_-2px_8px_rgba(220,38,38,0.5)]" : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-red-300 dark:group-hover:bg-red-800"}`} />
          </Link>
          <Link href="/profile" className={`relative text-sm font-semibold transition-all duration-300 hover:text-red-600 dark:hover:text-red-400 group ${pathname === "/profile" ? "text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            Pengaturan
            <span className={`absolute -bottom-5 left-0 h-[2px] w-full rounded-t-full transition-all duration-300 ${pathname === "/profile" ? "bg-red-600 dark:bg-red-500 shadow-[0_-2px_8px_rgba(220,38,38,0.5)]" : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-red-300 dark:group-hover:bg-red-800"}`} />
          </Link>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
