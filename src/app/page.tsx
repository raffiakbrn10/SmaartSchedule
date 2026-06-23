import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return <div className="flex min-h-screen flex-col bg-neutral-50 transition-colors dark:bg-black">
    <nav aria-label="Navigasi utama" className="mx-auto flex w-full max-w-7xl items-center justify-between p-5 sm:p-6">
      <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/30 dark:bg-cyan-500">S</span><span className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 sm:text-2xl">SmartSchedule</span></Link>
      <ThemeToggle />
    </nav>
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16 text-center">
      <div aria-hidden className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl dark:bg-cyan-500/10" />
      <div className="relative max-w-5xl">
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-cyan-400">Fokus pada yang penting</p>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl md:text-7xl">Manajemen jadwal<br className="hidden md:block" /> <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-500">lebih modern & elegan</span></h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">Kelola tugas, pantau progres, sinkronkan kalender, dan dapatkan pengingat deadline tanpa kehilangan fokus.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-cyan-600 dark:hover:bg-cyan-500">Masuk sekarang</Link>
          <Link href="/register" className="rounded-xl border border-neutral-200 bg-white px-8 py-4 font-semibold text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">Buat akun baru</Link>
        </div>
      </div>
    </main>
  </div>;
}
